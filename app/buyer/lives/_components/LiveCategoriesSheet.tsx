'use client'

import { useSyncExternalStore, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ALL_LIVE_CATEGORY, LIVE_CATEGORIES, type LiveCategory } from '@/lib/liveCategoryMock'
import { CloseIcon, LiveCategoryIcon } from './LivesIcons'

export type LiveCategoriesSheetProps = {
  open: boolean
  onClose: () => void
  selectedId: string
  onSelect: (categoryId: string) => void
  /** Loaded live items per category id ("all" holds the total). */
  liveCounts: Record<string, number>
  /** Loaded upcoming items per category id ("all" holds the total). */
  upcomingCounts: Record<string, number>
}

const TILES: LiveCategory[] = [ALL_LIVE_CATEGORY, ...LIVE_CATEGORIES]

const noopSubscribe = () => () => {}

function CountLine({ live, upcoming }: { live: number; upcoming: number }) {
  if (live > 0) return <span className="text-[12px] font-semibold text-brand-300">{live} en vivo</span>
  if (upcoming > 0) return <span className="text-[12px] font-semibold text-(--violet-400)">{upcoming} próximos</span>
  return <span className="text-[12px] text-(--ink-3)">Sin lives</span>
}

// Portal: .screen-enter creates a stacking context that would trap position:fixed.
export function LiveCategoriesSheet({ open, onClose, selectedId, onSelect, liveCounts, upcomingCounts }: LiveCategoriesSheetProps) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  if (!isClient || !open) return null

  const liveNow = liveCounts[ALL_LIVE_CATEGORY.id] ?? 0

  return createPortal(
    <>
      <div className="stock-filter-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="stock-filter-drawer lg:max-w-xl lg:mx-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Categorías de lives"
      >
        <div className="stock-filter-handle" />

        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex flex-col gap-1">
            <span className="font-display font-extrabold text-[22px] text-(--ink-0)">Categorías</span>
            <span className="text-[13px] text-(--ink-3)">
              {LIVE_CATEGORIES.length} categorías · {liveNow} lives ahora
            </span>
          </div>
          <button type="button" onClick={onClose} className="stock-filter-close" aria-label="Cerrar">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 p-5 overflow-y-auto">
          {TILES.map((category) => {
            const live = liveCounts[category.id] ?? 0
            const upcoming = upcomingCounts[category.id] ?? 0
            const selected = selectedId === category.id
            const tintStyle = { '--lives-tint': category.tint } as CSSProperties
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onSelect(category.id)
                  onClose()
                }}
                aria-pressed={selected}
                className={`buyer-lives-cat-tile${selected ? ' selected' : ''}`}
                style={tintStyle}
              >
                {live > 0 && <span className="stock-filter-inv-card-dot" aria-hidden="true" />}
                <span className="buyer-lives-cat-icon w-12 h-12">
                  <LiveCategoryIcon icon={category.icon} size={24} />
                </span>
                <span className="font-display font-bold text-[14px] text-(--ink-0) mt-1">{category.label}</span>
                <CountLine live={live} upcoming={upcoming} />
              </button>
            )
          })}
        </div>
      </div>
    </>,
    document.body,
  )
}
