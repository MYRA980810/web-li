'use client'

import { useState } from 'react'
import { HotProductFields, hotProductDraftToFormData, emptyHotProductDraft, type HotProductDraft } from '@/components/HotProductFields'
import { addHotLiveProduct } from '@/lib/liveActions'
import type { LiveProduct } from './LiveStockDrawer'

type Props = {
  liveId: string
  open: boolean
  onClose: () => void
  onSave: (product: LiveProduct) => void
}

export function LiveAddProductDrawer({ liveId, open, onClose, onSave }: Props) {
  const [draft,      setDraft]      = useState<HotProductDraft>(emptyHotProductDraft)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit() {
    if (!draft.name.trim()) return
    const stockVal = parseInt(draft.stock, 10)
    if (!stockVal || stockVal < 1) {
      setError('El stock debe ser mínimo 1')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await addHotLiveProduct(liveId, hotProductDraftToFormData(draft))

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    const api = result.product
    const product: LiveProduct = {
      id:       api.id,
      name:     api.productNameSnapshot,
      price:    api.priceSnapshot,
      currency: api.currencySnapshot,
      stock:    api.stockAllocated - api.stockSold,
      isHot:    api.isHot,
      isPinned: api.isPinned,
      status:   api.status,
      imageUrl: api.imageUrl,
    }

    onSave(product)
    handleReset()
  }

  function handleReset() {
    setDraft(emptyHotProductDraft)
    setIsLoading(false)
    setError(null)
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  return (
    <>
      <div className="live-stock-overlay" onClick={handleClose} aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Añadir Producto en Caliente"
      >
        <div className="live-stock-handle" />

        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <span className="live-stock-title">Añadir Producto en Caliente</span>
          </div>
          <button
            className="live-stock-close"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          <div className="live-add-form">
            <HotProductFields idPrefix="lap" draft={draft} onChange={setDraft} disabled={isLoading} />

            {/* Error */}
            {error && (
              <p style={{ color: '#ff4d6d', fontSize: '13px', margin: 0 }}>{error}</p>
            )}

            {/* CTA */}
            <div className="live-add-cta-group">
              <button
                type="button"
                className="live-add-cta"
                onClick={handleSubmit}
                disabled={!draft.name.trim() || isLoading}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 1L8.8 5.4H13.4L9.7 8.1L11.1 12.5L7 9.8L2.9 12.5L4.3 8.1L0.6 5.4H5.2L7 1Z" fill="currentColor" />
                </svg>
                {isLoading ? 'Guardando...' : 'Guardar y Lanzar'}
              </button>
              <p className="live-add-cta-sub">
                Sincronización inmediata con el carrito del espectador
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
