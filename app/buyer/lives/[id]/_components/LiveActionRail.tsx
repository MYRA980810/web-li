import { BagIcon } from '@/components/icons/BuyerNavIcons'
import { HeartIcon, ShareIcon } from '@/components/icons/LiveActionIcons'

export type LiveActionRailProps = {
  /** The audio control is a client component passed in as a slot. */
  audio: React.ReactNode
  like: { liked: boolean; countLabel: string; onToggle: () => void }
  share: { label: string; onShare: () => void }
  bag: { count: number; onOpen: () => void }
}

export function LiveActionRail({ audio, like, share, bag }: LiveActionRailProps) {
  return (
    <div className="flex flex-col items-center gap-4 shrink-0">
      {audio}

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={like.onToggle}
          aria-pressed={like.liked}
          aria-label={like.liked ? 'Quitar me gusta' : 'Me gusta'}
          className={`live-player-round-btn${like.liked ? ' liked' : ''}`}
        >
          <HeartIcon filled />
        </button>
        <span className="live-player-rail-label">{like.countLabel}</span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button type="button" onClick={share.onShare} aria-label="Compartir live" className="live-player-round-btn">
          <ShareIcon />
        </button>
        <span className="live-player-rail-label" aria-live="polite">
          {share.label}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={bag.onOpen}
          aria-label={`Abrir bolsa${bag.count > 0 ? `, ${bag.count} productos` : ''}`}
          className="live-player-round-btn live-player-bag-btn"
        >
          <BagIcon />
          {bag.count > 0 && (
            <span className="live-player-bag-count" aria-hidden="true">
              {bag.count}
            </span>
          )}
        </button>
        <span className="live-player-rail-label">Bolsa</span>
      </div>
    </div>
  )
}
