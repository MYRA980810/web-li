'use client'

import type { CSSProperties } from 'react'
import type { LiveCategory } from '@/lib/liveCategories'
import { LiveCategoryIcon } from '@/components/LiveCategoryIcon'

export type LiveCategoryPickerProps = {
  categories: readonly LiveCategory[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Suffix for element ids when the same form renders more than once (mobile/desktop). */
  idSuffix?: string
  /** Id of the visible label element, for aria-labelledby. */
  labelledBy?: string
  disabled?: boolean
}

type TintStyle = CSSProperties & { '--lives-tint': string }

export function LiveCategoryPicker({ categories, selectedId, onSelect, idSuffix = '', labelledBy, disabled = false }: LiveCategoryPickerProps) {
  if (categories.length === 0) {
    return (
      <p id={`live-category-empty${idSuffix}`} className="text-[13px] text-(--ink-3)">
        No pudimos cargar las categorías. Intenta de nuevo más tarde.
      </p>
    )
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-4 gap-2">
      {categories.map((category) => {
        const selected = selectedId === category.id
        const tintStyle: TintStyle = { '--lives-tint': category.tint }
        return (
          <button
            key={category.id}
            id={`live-category-${category.slug}${idSuffix}`}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(category.id)}
            disabled={disabled}
            className={`live-category-option${selected ? ' selected' : ''}`}
            style={tintStyle}
          >
            <span className="live-category-option-icon w-10 h-10">
              <LiveCategoryIcon icon={category.icon} size={20} />
            </span>
            <span className="font-display font-bold text-[12px] leading-tight text-(--ink-0) truncate max-w-full">
              {category.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
