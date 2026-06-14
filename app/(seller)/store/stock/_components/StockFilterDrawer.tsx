'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Category } from '@/lib/types'

export type SortOption = 'none' | 'price_desc' | 'price_asc' | 'newest'
export type InventoryFilter = 'all' | 'critical' | 'normal'

export type StockFilters = {
  sortBy: SortOption
  categoryId: string | null
  inventoryStatus: InventoryFilter
}

export const DEFAULT_FILTERS: StockFilters = {
  sortBy: 'none',
  categoryId: null,
  inventoryStatus: 'all',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'none', label: 'Sin orden' },
  { value: 'newest', label: 'Recién Agregados' },
  { value: 'price_desc', label: 'Mayor Precio' },
  { value: 'price_asc', label: 'Menor Precio' },
]

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5L17.5 16.5H2.5L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 8.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="10" cy="14" r="0.75" fill="currentColor"/>
  </svg>
)

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 9h8M6 12.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

type Props = {
  open: boolean
  onClose: () => void
  filters: StockFilters
  onApply: (filters: StockFilters) => void
  availableCategories: Category[]
}

export function StockFilterDrawer({ open, onClose, filters, onApply, availableCategories }: Props) {
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState<StockFilters>(filters)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || !open) return null

  function toggleCategory(id: string) {
    setDraft(prev => ({ ...prev, categoryId: prev.categoryId === id ? null : id }))
  }

  function toggleInventory(status: 'critical' | 'normal') {
    setDraft(prev => ({
      ...prev,
      inventoryStatus: prev.inventoryStatus === status ? 'all' : status,
    }))
  }

  function handleApply() {
    onApply(draft)
  }

  function handleClear() {
    onApply(DEFAULT_FILTERS)
  }

  return createPortal(
    <>
      <div className="stock-filter-overlay" onClick={onClose} aria-hidden="true" />

      <div className="stock-filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros de Stock">
        <div className="stock-filter-handle" />

        <div className="stock-filter-header">
          <span className="stock-filter-title">Filtros de Stock</span>
          <button className="stock-filter-close" onClick={onClose} aria-label="Cerrar filtros">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="stock-filter-body">

          {/* Sort */}
          <div className="stock-filter-section">
            <span className="stock-filter-section-label">Ordenar por</span>
            <div className="stock-filter-chips">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`stock-filter-chip${draft.sortBy === opt.value ? ' selected' : ''}`}
                  onClick={() => setDraft(prev => ({ ...prev, sortBy: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories — single select */}
          {availableCategories.length > 0 && (
            <div className="stock-filter-section">
              <span className="stock-filter-section-label">Categoría</span>
              <div className="stock-filter-chips">
                {availableCategories.map(cat => (
                  <button
                    key={cat.id}
                    className={`stock-filter-chip${draft.categoryId === cat.id ? ' selected' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inventory status */}
          <div className="stock-filter-section">
            <span className="stock-filter-section-label">Estado de Inventario</span>
            <div className="stock-filter-inv-cards">
              <button
                className={`stock-filter-inv-card critical${draft.inventoryStatus === 'critical' ? ' selected' : ''}`}
                onClick={() => toggleInventory('critical')}
              >
                {draft.inventoryStatus === 'critical' && <div className="stock-filter-inv-card-dot" />}
                <div className="stock-filter-inv-card-icon critical">
                  <WarningIcon />
                </div>
                <div>
                  <p className="stock-filter-inv-card-name">Stock Crítico</p>
                  <p className="stock-filter-inv-card-sub">Menos de 5 unidades</p>
                </div>
              </button>

              <button
                className={`stock-filter-inv-card normal${draft.inventoryStatus === 'normal' ? ' selected' : ''}`}
                onClick={() => toggleInventory('normal')}
              >
                {draft.inventoryStatus === 'normal' && <div className="stock-filter-inv-card-dot" />}
                <div className="stock-filter-inv-card-icon normal">
                  <BoxIcon />
                </div>
                <div>
                  <p className="stock-filter-inv-card-name">Stock Normal</p>
                  <p className="stock-filter-inv-card-sub">Gestión estándar</p>
                </div>
              </button>
            </div>
          </div>

          {/* Promo */}
          <div className="stock-filter-promo">
            <p className="stock-filter-promo-title">Filtrá tu éxito</p>
            <p className="stock-filter-promo-sub">
              Encontrá los productos que más necesitan tu atención en el próximo Live.
            </p>
          </div>

        </div>

        <div className="stock-filter-footer">
          <button className="stock-filter-clear-btn" onClick={handleClear}>
            Limpiar filtros
          </button>
          <button className="stock-filter-apply-btn" onClick={handleApply}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
