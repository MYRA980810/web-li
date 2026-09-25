'use client'

import { ALL_LIVE_CATEGORY, LIVE_CATEGORIES } from '@/lib/liveCategoryMock'
import { SlidersIcon } from './LivesIcons'

export type LiveCategoryBarProps = {
  selectedId: string
  onSelect: (categoryId: string) => void
  onOpenSheet: () => void
}

const CHIPS = [ALL_LIVE_CATEGORY, ...LIVE_CATEGORIES]

export function LiveCategoryBar({ selectedId, onSelect, onOpenSheet }: LiveCategoryBarProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenSheet}
        className={`buyer-lives-filter-btn${selectedId !== ALL_LIVE_CATEGORY.id ? ' active' : ''}`}
        aria-label="Ver categorías"
      >
        <SlidersIcon size={20} />
      </button>
      <span className="w-px h-7 bg-(--line-strong) shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        {CHIPS.map((category) => (
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
