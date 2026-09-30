'use client'

import { ALL_LIVE_CATEGORY, type LiveCategory } from '@/lib/liveCategories'
import { SlidersIcon } from './LivesIcons'

export type LiveCategoryBarProps = {
  /** Featured categories shown as chips after "Todo". */
  categories: readonly LiveCategory[]
  selectedId: string
  onSelect: (categoryId: string) => void
  onOpenSheet: () => void
}

export function LiveCategoryBar({ categories, selectedId, onSelect, onOpenSheet }: LiveCategoryBarProps) {
  const chips = [ALL_LIVE_CATEGORY, ...categories]
  const hasCategories = categories.length > 0
  return (
    <div className="flex items-center gap-3">
      {hasCategories && (
        <>
          <button
            type="button"
            onClick={onOpenSheet}
            className={`buyer-lives-filter-btn${selectedId !== ALL_LIVE_CATEGORY.id ? ' active' : ''}`}
            aria-label="Ver categorías"
          >
            <SlidersIcon size={20} />
          </button>
          <span className="w-px h-7 bg-(--line-strong) shrink-0" aria-hidden="true" />
        </>
      )}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        {chips.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selectedId === category.id}
            className={`buyer-lives-chip${selectedId === category.id ? ' selected' : ''}`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}
