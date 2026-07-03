'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { StockProductPicker, defaultVariant } from '@/components/StockProductPicker'
import { addCatalogLiveProduct } from '@/lib/liveActions'
import type { ProductView, Category } from '@/lib/types'

type Props = {
  liveId: string
  products: ProductView[]
  categories: Category[]
}

export function SelectLiveStockScreen({ liveId, products, categories }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    if (selected.size === 0 || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const selectedProducts = [...selected].map((id) => productsById.get(id)).filter((p): p is ProductView => !!p)

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
        })
      }),
    )

    const failedCount = results.filter((r) => !r.ok).length
    if (failedCount > 0) {
      setError(`No se pudieron agregar ${failedCount} producto(s). Intentá de nuevo.`)
      setIsSubmitting(false)
      return
    }

    router.push(`/live/${liveId}/products/success`)
  }

  const content = (
    <div className="flex flex-col gap-4">
      <StockProductPicker products={products} categories={categories} selected={selected} onToggle={toggle} />
      {error && (
        <p className="text-[13px] text-red-400 font-medium leading-snug">{error}</p>
      )}
    </div>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href={`/live/${liveId}`} className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <span className="font-display font-bold text-[14px] text-brand-400 tracking-[0.06em] uppercase">
            Agregar Productos
          </span>
          <button
            type="button"
            className="text-[13px] font-semibold text-brand-400 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={selected.size === 0 || isSubmitting}
          >
            Confirmar
          </button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          {content}
        </div>

        <div className="px-5 pb-4 reveal d2">
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

        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href={`/live/${liveId}`}
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
            Agregar Productos
          </span>
          <button
            type="button"
            className="text-[13px] font-semibold text-brand-400 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={selected.size === 0 || isSubmitting}
          >
            Confirmar
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md flex flex-col gap-4">
            {content}
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
      </div>
    </>
  )
}
