'use client'

import { useSyncExternalStore, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { ActiveLiveCounts } from '@/lib/liveActions'
import { ALL_LIVE_CATEGORY, type LiveCategory } from '@/lib/liveCategories'
import { CloseIcon, LiveCategoryIcon } from './LivesIcons'

export type LiveCategoriesSheetProps = {
  open: boolean
  onClose: () => void
  selectedId: string
  onSelect: (categoryId: string) => void
  /** Featured categories shown as tiles after "Todo". */
  categories: readonly LiveCategory[]
  /** Backend LIVE counts; null when they could not be loaded (tiles show no numbers). */
  counts: ActiveLiveCounts | null
}

const noopSubscribe = () => () => {}

function CountLine({ live }: { live: number | null }) {
  if (live === null) return null
  if (live > 0) return <span className="text-[12px] font-semibold text-brand-300">{live} en vivo</span>
  return <span className="text-[12px] text-(--ink-3)">Sin lives en vivo</span>
}

// Portal: .screen-enter creates a stacking context that would trap position:fixed.
export function LiveCategoriesSheet({ open, onClose, selectedId, onSelect, categories, counts }: LiveCategoriesSheetProps) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  if (!isClient || !open) return null

  const tiles: LiveCategory[] = [ALL_LIVE_CATEGORY, ...categories]
  const countFor = (categoryId: string): number | null => {
    if (!counts) return null
    if (categoryId === ALL_LIVE_CATEGORY.id) return counts.total
    return counts.byCategory[categoryId] ?? 0
  }

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
              {categories.length} categorías{counts && ` · ${counts.total} lives ahora`}
            </span>
          </div>
          <button type="button" onClick={onClose} className="stock-filter-close" aria-label="Cerrar">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 p-5 overflow-y-auto">
          {tiles.map((category) => {
            const live = countFor(category.id)
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
                {live !== null && live > 0 && <span className="stock-filter-inv-card-dot" aria-hidden="true" />}
                <span className="buyer-lives-cat-icon w-12 h-12">
                  <LiveCategoryIcon icon={category.icon} size={24} />
                </span>
                <span className="font-display font-bold text-[14px] text-(--ink-0) mt-1">{category.label}</span>
                <CountLine live={live} />
              </button>
            )
          })}
        </div>
      </div>
    </>,
    document.body,
  )
}
