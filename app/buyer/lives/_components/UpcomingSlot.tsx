'use client'

import { useState } from 'react'
import type { LiveUpcomingCardResponse } from '@/lib/liveActions'
import type { LiveReminders } from '@/hooks/useLiveReminders'
import { formatClock, slotCountdown, type UpcomingSlotGroup } from '../_lib/livesView'
import { ChevronIcon, TimerIcon } from './LivesIcons'
import { StoreAvatar } from './StoreAvatar'
import { UpcomingCard } from './UpcomingCard'

export type UpcomingSlotProps = {
  slot: UpcomingSlotGroup<LiveUpcomingCardResponse>
  domId: string
  /** The next slot to start — highlighted pink with a live mm:ss countdown. */
  isCurrent: boolean
  now: number
  reminders: LiveReminders
  gridColumns: 'grid-cols-2' | 'grid-cols-4'
  /** How many tiles a multi-live slot shows before "Ver los N en cuadrícula". */
  collapsedCount: number
}

const MAX_STACKED_AVATARS = 3

export function UpcomingSlot({ slot, domId, isCurrent, now, reminders, gridColumns, collapsedCount }: UpcomingSlotProps) {
  const [expanded, setExpanded] = useState(false)
  const { items } = slot
  const isMulti = items.length > 1
  const countdown = slotCountdown(slot.startsAt, now)
  const allSubscribed = items.every((item) => reminders.isSubscribed(item.id))
  const canCollapse = isMulti && items.length > collapsedCount
  const visibleItems = canCollapse && !expanded ? items.slice(0, collapsedCount) : items

  return (
    <section id={domId} className="relative flex gap-3 scroll-mt-4" aria-label={`Lives de las ${formatClock(slot.startsAt)}`}>
      <span className="w-12 shrink-0 pt-1.5 font-display font-bold text-[16px] tabular-nums text-(--ink-0)">
        {formatClock(slot.startsAt)}
      </span>
      <div className="w-6 shrink-0 flex justify-center pt-2">
        <span className={`buyer-lives-slot-dot relative z-10${isCurrent ? ' current -mt-0.5' : ''}`} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3 pb-7">
        <div className="flex items-center gap-3 min-h-9">
          <span className={`buyer-lives-countdown${isCurrent ? ' current' : ''}`}>
            <TimerIcon size={16} />
            {countdown.label}
            {isCurrent && countdown.progress !== null && (
              <span className="buyer-lives-countdown-progress" style={{ width: `${Math.round(countdown.progress * 100)}%` }} />
            )}
          </span>
          {isMulti && <span className="text-[13px] text-(--ink-3) whitespace-nowrap">{items.length} a la vez</span>}
          {isMulti && (
            <button
              type="button"
              disabled={allSubscribed}
              onClick={() => reminders.subscribeMany(items.map((item) => item.id))}
              className={`buyer-lives-notify-all ml-auto${allSubscribed ? ' done' : ''}`}
            >
              {allSubscribed ? 'Avisado' : `Avisar ${items.length}`}
            </button>
          )}
        </div>

        {isMulti ? (
          <div className={`grid ${gridColumns} gap-3`}>
            {visibleItems.map((item) => (
              <UpcomingCard
                key={item.id}
                item={item}
                variant="tile"
                subscribed={reminders.isSubscribed(item.id)}
                pending={reminders.isPending(item.id)}
                onToggleReminder={reminders.toggle}
              />
            ))}
          </div>
        ) : (
          <UpcomingCard
            item={items[0]!}
            variant="row"
            subscribed={reminders.isSubscribed(items[0]!.id)}
            pending={reminders.isPending(items[0]!.id)}
            onToggleReminder={reminders.toggle}
          />
        )}

        {canCollapse && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className={`buyer-lives-expand-bar${expanded ? ' expanded' : ''}`}
          >
            <span className="flex items-center -space-x-1.5 shrink-0">
              {items.slice(0, MAX_STACKED_AVATARS).map((item) => (
                <StoreAvatar key={item.id} sellerName={item.sellerName} size="md" stacked />
              ))}
            </span>
            <span className="flex-1 min-w-0 truncate">{expanded ? 'Contraer franja' : `Ver los ${items.length} en cuadrícula`}</span>
            <span className="buyer-lives-expand-chevron">
              <ChevronIcon size={16} up={expanded} />
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
