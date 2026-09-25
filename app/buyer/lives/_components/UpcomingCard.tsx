'use client'

import type { LiveUpcomingCardResponse } from '@/lib/liveActions'
import { getLiveCategory } from '@/lib/liveCategoryMock'
import { sellerLabel } from '../_lib/livesView'
import { LiveCover } from './LiveCover'
import { ReminderBell } from './ReminderBell'
import { StoreAvatar } from './StoreAvatar'

export type UpcomingCardProps = {
  item: LiveUpcomingCardResponse
  /** "row": single live in its slot. "tile": one of several lives sharing a slot. */
  variant: 'row' | 'tile'
  subscribed: boolean
  pending: boolean
  onToggleReminder: (liveId: string) => void
}

export function UpcomingCard({ item, variant, subscribed, pending, onToggleReminder }: UpcomingCardProps) {
  const category = getLiveCategory(item.id)
  const cardClass = `buyer-lives-upcoming-card${subscribed ? ' reminded' : ''}`
  const bell = (
    <ReminderBell
      subscribed={subscribed}
      pending={pending}
      onToggle={() => onToggleReminder(item.id)}
      size={variant === 'row' ? 'lg' : 'md'}
    />
  )

  if (variant === 'row') {
    return (
      <div className={`${cardClass} flex items-center gap-3 p-3`}>
        <div className="relative w-[72px] h-[72px] shrink-0 overflow-hidden rounded-[14px]">
          <LiveCover liveId={item.id} thumbnailUrl={item.thumbnailUrl} title={item.title} sizes="72px" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-(--ink-3)">{category.label}</span>
          <span className="font-display font-bold text-[16px] leading-tight text-(--ink-0) truncate">{item.title}</span>
          <span className="text-[13px] text-(--ink-3) truncate">{sellerLabel(item.sellerName)}</span>
        </div>
        {bell}
      </div>
    )
  }

  return (
    <div className={`${cardClass} flex flex-col p-2`}>
      <div className="relative aspect-16/10 overflow-hidden rounded-[14px]">
        <LiveCover liveId={item.id} thumbnailUrl={item.thumbnailUrl} title={item.title} sizes="(min-width: 1024px) 20vw, 45vw" />
        <div className="absolute top-2 right-2 z-10">{bell}</div>
        <span className="absolute bottom-2 left-2 z-10 buyer-lives-category-tag">{category.label}</span>
      </div>
      <div className="flex flex-col gap-2 px-1.5 pt-2.5 pb-1.5">
        <span className="font-display font-bold text-[15px] leading-snug text-(--ink-0) line-clamp-2">{item.title}</span>
        <div className="flex items-center gap-2 min-w-0">
          <StoreAvatar sellerName={item.sellerName} />
          <span className="text-[13px] text-(--ink-3) truncate">{sellerLabel(item.sellerName)}</span>
        </div>
      </div>
    </div>
  )
}
