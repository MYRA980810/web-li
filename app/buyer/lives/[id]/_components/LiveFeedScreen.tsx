'use client'

import { useRouter } from 'next/navigation'
import { BagIcon } from '@/components/icons/BuyerNavIcons'
import { CommentIcon, HeartIcon, ShareIcon } from '@/components/icons/LiveActionIcons'
import { getLiveById } from '@/lib/mockLives'

const PINNED_THUMB_BG = 'linear-gradient(135deg, #7c3f6b, #3a1a30)'
const LIKES = '1.2k'
const COMMENTS = 86
const CART_COUNT = 3

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button className="live-feed-action-btn" aria-label={label}>
        {icon}
      </button>
      <span className="text-[11px] font-semibold text-white/90">{label}</span>
    </div>
  )
}

export function LiveFeedScreen({ liveId }: { liveId: string }) {
  const router = useRouter()
  const live = getLiveById(liveId)

  return (
    <div className="live-feed-stage" style={{ background: live.bg }}>
      <div className="live-feed-overlay" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-5 z-10">
        <button className="live-feed-icon-btn" onClick={() => router.push('/buyer/lives')} aria-label="Cerrar">
          ✕
        </button>
        <button className="live-feed-icon-btn" aria-label="Buscar">🔍</button>
      </div>

      <div className="absolute top-16 left-4 z-10">
        <span className="live-badge">
          <span className="dot" />
          En vivo
        </span>
      </div>

      <div className="live-feed-badge absolute top-16 right-4 z-10">👁 {live.viewers}</div>

      <div className="absolute right-3 bottom-56 z-10 flex flex-col items-center gap-5">
        <ActionButton icon={<HeartIcon />} label={LIKES} />
        <ActionButton icon={<CommentIcon />} label={String(COMMENTS)} />
        <ActionButton icon={<ShareIcon />} label="Enviar" />
        <div className="flex flex-col items-center gap-1.5">
          <button className="live-feed-cart-btn" aria-label="Carrito">
            <BagIcon />
          </button>
          <span className="text-[11px] font-semibold text-white/90">{CART_COUNT}</span>
        </div>
      </div>

      <div className="absolute left-4 right-4 bottom-32 z-10 flex items-end justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="live-feed-avatar" style={{ background: live.color }} />
          <div className="min-w-0">
            <p className="font-display font-bold text-[15px] text-white">{live.store}</p>
            <p className="text-[12px] text-white/70 leading-snug">
              {live.categoryLabel} · {live.location}
            </p>
            <p className="text-[13px] text-white mt-2 leading-snug max-w-64">{live.caption}</p>
          </div>
        </div>
        <button className="bg-white text-[#1a0612] text-[13px] font-bold px-5 py-2 rounded-full shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          Seguir
        </button>
      </div>

      <div className="absolute left-4 right-4 bottom-12 z-10">
        <div className="live-feed-pinned-card">
          <div className="live-feed-pinned-thumb" style={{ background: PINNED_THUMB_BG }} />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="live-feed-pinned-badge">Anclado</span>
            <p className="text-[13px] font-bold text-white truncate">{live.product}</p>
            <p className="text-[13px] font-bold text-brand-400">{live.pinnedPrice}</p>
          </div>
          <button className="live-launch-btn shrink-0">Comprar</button>
        </div>
      </div>

      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/50 z-10">
        ↑ desliza para el siguiente live
      </p>
    </div>
  )
}
