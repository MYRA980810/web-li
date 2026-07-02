'use client'

import { useCallback, useEffect, useRef } from 'react'

// Keep in sync with the CSS literals in `.schedule-live-time-wheel-col` /
// `.schedule-live-time-wheel-item` / `.schedule-live-time-wheel-band` (globals.css).
export const TIME_WHEEL_ITEM_HEIGHT = 44
export const TIME_WHEEL_VISIBLE_ROWS = 3
export const TIME_WHEEL_HEIGHT = TIME_WHEEL_ITEM_HEIGHT * TIME_WHEEL_VISIBLE_ROWS

export type TimeWheelProps = {
  values: number[]
  selected: number | null
  onSelect: (value: number) => void
  formatValue: (value: number) => string
  disabled?: boolean
  ariaLabel: string
}

export function TimeWheel({ values, selected, onSelect, formatValue, disabled = false, ariaLabel }: TimeWheelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const settle = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const rawIndex = Math.round(el.scrollTop / TIME_WHEEL_ITEM_HEIGHT)
    const index = Math.min(Math.max(rawIndex, 0), values.length - 1)
    onSelect(values[index])
    el.scrollTo({ top: index * TIME_WHEEL_ITEM_HEIGHT, behavior: 'smooth' })
  }, [values, onSelect])

  const handleScroll = useCallback(() => {
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
    settleTimeoutRef.current = setTimeout(settle, 120)
  }, [settle])

  // `scrollend` isn't part of React's synthetic event system — attach natively.
  // Safari support is inconsistent, so the debounced `handleScroll` above is the fallback.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onScrollEnd() {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
      settle()
    }

    el.addEventListener('scrollend', onScrollEnd)
    return () => el.removeEventListener('scrollend', onScrollEnd)
  }, [settle])

  function scrollToValue(value: number) {
    const el = scrollRef.current
    if (!el || disabled) return
    const index = values.indexOf(value)
    if (index === -1) return
    // Update state directly — don't rely solely on the scroll/scrollend
    // listeners. When `value` is already the centered item (e.g. index 0 on
    // first mount), `scrollTo` targets a position the element is already
    // at, so no `scroll` event fires and `settle()` would never run.
    onSelect(value)
    el.scrollTo({ top: index * TIME_WHEEL_ITEM_HEIGHT, behavior: 'smooth' })
  }

  return (
    <div
      ref={scrollRef}
      className="schedule-live-time-wheel-col scrollbar-hide"
      onScroll={disabled ? undefined : handleScroll}
      role="listbox"
      aria-label={ariaLabel}
    >
      {values.map((value) => (
        <button
          key={value}
          type="button"
          role="option"
          aria-selected={value === selected}
          className={`schedule-live-time-wheel-item${value === selected ? ' selected' : ''}`}
          onClick={() => scrollToValue(value)}
          disabled={disabled}
        >
          {formatValue(value)}
        </button>
      ))}
    </div>
  )
}
