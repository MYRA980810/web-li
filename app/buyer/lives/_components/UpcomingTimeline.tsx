'use client'

import { useMemo, useState } from 'react'
import type { LiveUpcomingCardResponse } from '@/lib/liveActions'
import type { LiveReminders } from '@/hooks/useLiveReminders'
import { useCountdown } from '@/hooks/useCountdown'
import { dayLabel, formatClock, formatDayDate, groupUpcomingByDay, isToday, shortDayLabel } from '../_lib/livesView'
import { UpcomingSlot } from './UpcomingSlot'

export type UpcomingTimelineProps = {
  items: LiveUpcomingCardResponse[]
  reminders: LiveReminders
  /** Prefix for slot DOM ids — mobile and desktop trees render side by side. */
  idPrefix: string
  gridColumns: 'grid-cols-2' | 'grid-cols-4'
  collapsedCount: number
}

export function UpcomingTimeline({ items, reminders, idPrefix, gridColumns, collapsedCount }: UpcomingTimelineProps) {
  // Single shared interval for every countdown in this timeline.
  const now = useCountdown(1000)
  const days = useMemo(() => groupUpcomingByDay(items), [items])
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null)

  const slots = days.flatMap((day) => day.slots.map((slot) => ({ slot, dayStart: day.dayStart })))
  const firstSlotKey = slots[0]?.slot.key ?? null
  const activeSlotKey = slots.some(({ slot }) => slot.key === selectedSlotKey) ? selectedSlotKey : firstSlotKey

  // Times and day labels depend on the viewer's clock and time zone — render
  // only on the client to avoid SSR/hydration mismatches.
  if (now === null) return <div className="h-40" aria-hidden="true" />
  if (slots.length === 0) return null

  const slotDomId = (key: string) => `${idPrefix}-slot-${key}`

  function goToSlot(key: string) {
    setSelectedSlotKey(key)
    document.getElementById(slotDomId(key))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 lg:mx-0 lg:px-0">
        {slots.map(({ slot, dayStart }) => (
          <button
            key={slot.key}
            type="button"
            onClick={() => goToSlot(slot.key)}
            className={`buyer-lives-slot-chip${slot.key === activeSlotKey ? ' active' : ''}`}
          >
            <span>
              {shortDayLabel(dayStart, now)} <span className="font-display font-bold tabular-nums">{formatClock(slot.startsAt)}</span>
            </span>
            <span className="buyer-lives-slot-chip-count">{slot.items.length}</span>
          </button>
        ))}
      </div>

      {days.map((day) => (
        <div key={day.key} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display font-bold text-[22px] leading-none ${isToday(day.dayStart, now) ? 'text-brand-300' : 'text-(--ink-0)'}`}
            >
              {dayLabel(day.dayStart, now)}
            </span>
            <span className="text-[13px] text-(--ink-3)">{formatDayDate(day.dayStart)}</span>
            <span className="flex-1 h-px bg-(--line-strong) self-center mx-2" aria-hidden="true" />
            <span className="text-[13px] text-(--ink-3)">
              {day.total} {day.total === 1 ? 'live' : 'lives'}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-[71.5px] top-4 bottom-0 w-px bg-(--line-strong)" aria-hidden="true" />
            {day.slots.map((slot) => (
              <UpcomingSlot
                key={slot.key}
                slot={slot}
                domId={slotDomId(slot.key)}
                isCurrent={slot.key === firstSlotKey}
                now={now}
                reminders={reminders}
                gridColumns={gridColumns}
                collapsedCount={collapsedCount}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
