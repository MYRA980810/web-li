import Image from 'next/image'
import { CloseIcon, EyeIcon } from '@/components/icons/LiveActionIcons'
import { storeInitials } from '@/lib/visualFallbacks'

export type LiveHeaderProps = {
  storeName: string
  logoUrl: string | null
  /** e.g. "12.8 mil seguidores"; null hides the line. */
  subtitle: string | null
  follow: { following: boolean; pending: boolean; onToggle: () => void } | null
  onClose: () => void
  /** Only shown while the stream is actually on air. */
  onAir: boolean
  viewersLabel: string
}

export function LiveHeader({ storeName, logoUrl, subtitle, follow, onClose, onAir, viewersLabel }: LiveHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="live-player-glass-pill flex-1 min-w-0">
          <span className="live-player-avatar w-12 h-12 text-[16px]" aria-hidden="true">
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              storeInitials(storeName)
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-extrabold text-[17px] leading-tight text-white truncate">{storeName}</p>
            {subtitle && <p className="text-[13px] text-white/70 truncate">{subtitle}</p>}
          </div>
          {follow && (
            <button
              type="button"
              onClick={follow.onToggle}
              disabled={follow.pending}
              aria-pressed={follow.following}
              className={`live-player-follow-btn${follow.following ? ' following' : ''}`}
            >
              {follow.following ? 'Siguiendo' : 'Seguir'}
            </button>
          )}
        </div>
        <button type="button" onClick={onClose} className="live-player-round-btn" aria-label="Cerrar live">
          <CloseIcon size={22} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onAir && (
          <span className="live-player-onair-badge">
            <span className="dot" aria-hidden="true" />
            En vivo
          </span>
        )}
        <span className="live-feed-badge" aria-label={`${viewersLabel} espectadores`}>
          <EyeIcon />
          {viewersLabel}
        </span>
      </div>
    </header>
  )
}
