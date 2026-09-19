'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type StoreSortBy = 'recomendadas' | 'mejor_calificadas' | 'mas_seguidas' | 'ranking'
export type StoreMinRating = 0 | 4 | 4.5 | 4.8

export type StoreFilters = {
  sortBy: StoreSortBy
  minRating: StoreMinRating
  liveOnly: boolean
}

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  sortBy: 'ranking',
  minRating: 0,
  liveOnly: false,
}

const SORT_OPTIONS: { value: StoreSortBy; label: string }[] = [
  { value: 'recomendadas', label: 'Recomendadas' },
  { value: 'mejor_calificadas', label: 'Mejor calificadas' },
  { value: 'mas_seguidas', label: 'Más seguidas' },
  { value: 'ranking', label: 'Ranking Livento' },
]

const RATING_OPTIONS: { value: StoreMinRating; label: string }[] = [
  { value: 0, label: 'Todas' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
  { value: 4.8, label: '4.8+' },
]

type Props = {
  open: boolean
  onClose: () => void
  filters: StoreFilters
  onApply: (filters: StoreFilters) => void
  countForDraft: (draft: StoreFilters) => number
}

export function StoreFiltersSheet({ open, onClose, filters, onApply, countForDraft }: Props) {
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState<StoreFilters>(filters)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (open) setDraft(filters)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || !open) return null

  function toggleLiveOnly() {
    setDraft((prev) => ({ ...prev, liveOnly: !prev.liveOnly }))
  }

  return createPortal(
    <>
      <div className="stock-filter-overlay" onClick={onClose} aria-hidden="true" />

      <div className="stock-filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros de tiendas">
        <div className="stock-filter-handle" />

        <div className="stock-filter-header">
          <span className="stock-filter-title">Filtros</span>
          <button
            className="text-[12px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors"
            onClick={() => setDraft(DEFAULT_STORE_FILTERS)}
          >
            Restablecer
          </button>
        </div>

        <div className="stock-filter-body">
          <div className="stock-filter-section">
            <span className="stock-filter-section-label">Ordenar por</span>
            <div className="stock-filter-chips">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`stock-filter-chip${draft.sortBy === opt.value ? ' selected' : ''}`}
                  onClick={() => setDraft((prev) => ({ ...prev, sortBy: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-filter-section">
            <span className="stock-filter-section-label">Calificación mínima</span>
            <div className="stock-filter-chips">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`stock-filter-chip${draft.minRating === opt.value ? ' selected' : ''}`}
                  onClick={() => setDraft((prev) => ({ ...prev, minRating: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] font-semibold text-(--ink-0)">Solo en vivo ahora</span>
              <button
                className={`toggle-switch${draft.liveOnly ? ' on' : ''}`}
                onClick={toggleLiveOnly}
                aria-pressed={draft.liveOnly}
                aria-label="Solo en vivo ahora"
              />
            </div>
          </div>
        </div>

        <div className="stock-filter-footer">
          <button className="stock-filter-apply-btn w-full" onClick={() => onApply(draft)}>
            Ver {countForDraft(draft)} tiendas
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
