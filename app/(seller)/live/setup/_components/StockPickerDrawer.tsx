'use client'

import { StockProductPicker } from '@/components/StockProductPicker'
import type { ProductView, Category } from '@/lib/types'

type Props = {
  open: boolean
  onClose: () => void
  products: ProductView[]
  categories: Category[]
  selected: Set<string>
  onToggle: (id: string) => void
}

export function StockPickerDrawer({ open, onClose, products, categories, selected, onToggle }: Props) {
  if (!open) return null

  return (
    <>
      <div className="live-stock-overlay" onClick={onClose} aria-hidden="true" />

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
          <button
            className="live-stock-close"
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          <StockProductPicker products={products} categories={categories} selected={selected} onToggle={onToggle} />
        </div>

        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <button type="button" className="live-picker-cta" onClick={onClose}>
            Confirmar ({selected.size})
          </button>
        </div>
      </div>
    </>
  )
}
