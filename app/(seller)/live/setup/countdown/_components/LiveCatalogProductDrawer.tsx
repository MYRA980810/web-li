'use client'

import { useEffect, useState } from 'react'
import { StockProductPicker, defaultVariant, getPrimaryImage } from '@/components/StockProductPicker'
import { addCatalogLiveProduct, getLiveProducts } from '@/lib/liveActions'
import type { ProductView, Category } from '@/lib/types'

type Props = {
  liveId: string
  open: boolean
  onClose: () => void
  products: ProductView[]
  categories: Category[]
  onAdded: () => void
}

// The live already exists here, so unlike the go-live setup drawer, this
// submits addCatalogLiveProduct immediately instead of deferring.
export function LiveCatalogProductDrawer({ liveId, open, onClose, products, categories, onAdded }: Props) {
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  // Products already attached to this live (by catalog productId) — refetched
  // every time the drawer opens so the picker never re-offers them.
  const [existingProductIds, setExistingProductIds] = useState<Set<string>>(new Set())
  const [loadingExisting,    setLoadingExisting]    = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingExisting(true)
    getLiveProducts(liveId).then((result) => {
      if (result.ok) {
        const ids = result.products
          .map((p) => p.productId)
          .filter((id): id is string => !!id)
        setExistingProductIds(new Set(ids))
      }
      setLoadingExisting(false)
    })
  }, [open, liveId])

  if (!open) return null

  const availableProducts = products.filter((p) => !existingProductIds.has(p.id))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleReset() {
    setSelected(new Set())
    setError(null)
    setIsSubmitting(false)
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  async function handleConfirm() {
    if (selected.size === 0 || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const selectedProducts = availableProducts.filter((p) => selected.has(p.id))

    const results = await Promise.all(
      selectedProducts.map((p) => {
        const variant = defaultVariant(p)!
        return addCatalogLiveProduct(liveId, {
          productId:      p.id,
          variantId:      variant.id,
          nameSnapshot:   p.name,
          priceSnapshot:  variant.effectivePrice,
          currency:       p.currency,
          stockAllocated: variant.stock.availableQuantity,
          imageUrl:       getPrimaryImage(p),
        })
      }),
    )

    const failedCount = results.filter((r) => !r.ok).length
    if (failedCount > 0) {
      setError(`No se pudieron agregar ${failedCount} producto(s). Intentá de nuevo.`)
      setIsSubmitting(false)
      return
    }

    handleReset()
    onAdded()
  }

  return (
    <>
      <div className="live-stock-overlay" onClick={handleClose} aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Cargar Productos desde Stock"
      >
        <div className="live-stock-handle" />

        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <span className="live-stock-title">Cargar desde Stock</span>
          </div>
          <button className="live-stock-close" onClick={handleClose} aria-label="Cerrar" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          {loadingExisting ? (
            <p className="live-stock-status-text">Cargando tu catálogo...</p>
          ) : (
            <StockProductPicker products={availableProducts} categories={categories} selected={selected} onToggle={toggle} />
          )}
          {error && (
            <p style={{ color: '#ff4d6d', fontSize: '13px', margin: 0 }}>{error}</p>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <button
            type="button"
            className="live-picker-cta"
            onClick={handleConfirm}
            disabled={selected.size === 0 || isSubmitting}
          >
            <span aria-hidden="true">🎥</span>
            {isSubmitting ? 'Agregando...' : `Añadir al Live (${selected.size})`}
          </button>
        </div>
      </div>
    </>
  )
}
