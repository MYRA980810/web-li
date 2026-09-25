import Link from 'next/link'
import type { LiveFeedCardResponse } from '@/lib/liveActions'
import { formatCompactCount, sellerLabel } from '../_lib/livesView'
import { LiveCover } from './LiveCover'
import { StoreAvatar } from './StoreAvatar'

export type LiveNowGridProps = {
  items: LiveFeedCardResponse[]
  columns: 'grid-cols-2' | 'grid-cols-4'
}

export function LiveNowGrid({ items, columns }: LiveNowGridProps) {
  const sizes = columns === 'grid-cols-2' ? '50vw' : '25vw'
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <Link key={item.id} href={`/buyer/lives/${item.id}`} className="live-grid-card block">
          <div className="live-grid-card-media">
            <LiveCover liveId={item.id} thumbnailUrl={item.thumbnailUrl} title={item.title} sizes={sizes} />
          </div>
          <div className="live-grid-card-overlay" />
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2">
            <span className="buyer-lives-live-badge">
              <span className="dot" />
              LIVE
            </span>
            <span className="buyer-lives-viewers" aria-label={`${item.currentViewers} espectadores`}>
              {formatCompactCount(item.currentViewers)}
            </span>
          </div>
          <div className="live-grid-card-body gap-2! p-3!">
            <span className="font-display font-bold text-[15px] leading-tight text-white line-clamp-2">{item.title}</span>
            <div className="flex items-center gap-2 min-w-0">
              <StoreAvatar sellerName={item.sellerName} />
              <span className="text-[13px] text-white/75 truncate">{sellerLabel(item.sellerName)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
