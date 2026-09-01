'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MediaPlayer } from 'amazon-ivs-player'
import { BagIcon } from '@/components/icons/BuyerNavIcons'
import { CommentIcon, HeartIcon, ShareIcon, SpeakerIcon } from '@/components/icons/LiveActionIcons'
import { useLiveChat, type StockUpdateEvent, type ProductExpiredEvent } from '@/hooks/useLiveChat'
import { sendLiveHeartbeat, getLiveProducts, type LiveResponse, type LiveProductApiResponse } from '@/lib/liveActions'

const PINNED_THUMB_BG = 'linear-gradient(135deg, #7c3f6b, #3a1a30)'
const LIKES = '1.2k'
const COMMENTS = 86
const CART_COUNT = 3
const HEARTBEAT_INTERVAL_MS = 15000
const VIEWER_ID_KEY = 'live-viewer-id'

function getOrCreateViewerId(): string {
  try {
    const existing = sessionStorage.getItem(VIEWER_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(VIEWER_ID_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

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

export type LiveFeedScreenProps = {
  live: LiveResponse | null
  products: LiveProductApiResponse[]
}

export function LiveFeedScreen({ live, products }: LiveFeedScreenProps) {
  const router = useRouter()

  if (!live) {
    return (
      <div className="live-feed-stage live-feed-fallback-bg">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
          <p className="text-[13px] text-white/70 text-center">No pudimos cargar este live. Puede que ya no esté disponible.</p>
          <button
            onClick={() => router.push('/buyer/lives')}
            className="bg-white text-[#1a0612] text-[13px] font-bold px-5 py-2 rounded-full"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return <LiveFeedContent live={live} products={products} />
}

function LiveFeedContent({ live, products }: { live: LiveResponse; products: LiveProductApiResponse[] }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<MediaPlayer | null>(null)
  const [playbackError, setPlaybackError] = useState(false)
  const [muted, setMuted] = useState(true)
  const [liveProducts, setLiveProducts] = useState<LiveProductApiResponse[]>(products)
  // Read inside the async player-creation effect so a mute toggle clicked
  // before the player finishes loading isn't clobbered by a stale value.
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const isLive = live.status === 'LIVE' && !!live.ivsPlaybackUrl
  const pinnedProduct = liveProducts.find((p) => p.isPinned) ?? null

  function toggleMute() {
    setMuted((prev) => !prev)
  }

  const { viewerCount } = useLiveChat(live.id, {
    onProductPinned: () => {
      void getLiveProducts(live.id).then((result) => {
        if (result.ok) setLiveProducts(result.products)
      })
    },
    onStockUpdate: ({ liveProductId, stockRemaining }: StockUpdateEvent) => {
      setLiveProducts((prev) =>
        prev.map((p) =>
          p.id === liveProductId ? { ...p, stockSold: p.stockAllocated - stockRemaining } : p,
        ),
      )
    },
    onProductExpired: ({ liveProductId, status }: ProductExpiredEvent) => {
      setLiveProducts((prev) =>
        prev.map((p) => (p.id === liveProductId ? { ...p, isPinned: false, status } : p)),
      )
    },
  })
  const formattedViewers =
    viewerCount === null ? '—' : viewerCount >= 1000 ? `${(viewerCount / 1000).toFixed(1)}k` : String(viewerCount)

  // Dynamically imported — the WASM player SDK only loads for viewers actually
  // watching a live stream, not on every visit to this route.
  useEffect(() => {
    if (!isLive || !videoRef.current) return
    let cancelled = false

    void (async () => {
      const { create, isPlayerSupported, PlayerEventType } = await import('amazon-ivs-player')
      if (cancelled || !videoRef.current) return
      if (!isPlayerSupported) {
        setPlaybackError(true)
        return
      }

      const player = create({
        wasmWorker: '/ivs-player/amazon-ivs-wasmworker.min.js',
        wasmBinary: '/ivs-player/amazon-ivs-wasmworker.min.wasm',
      })
      playerRef.current = player
      player.attachHTMLVideoElement(videoRef.current)
      player.addEventListener(PlayerEventType.ERROR, () => {
        setPlaybackError(true)
        // The effect's own cleanup only runs on unmount/dep change, not on this
        // state update — dispose here so a playback error doesn't leak the
        // player instance for the rest of this live's viewing session.
        player.delete()
        if (playerRef.current === player) playerRef.current = null
      })
      player.setMuted(mutedRef.current)
      player.setAutoplay(true)
      player.load(live.ivsPlaybackUrl!)
      player.play()
    })()

    return () => {
      cancelled = true
      playerRef.current?.delete()
      playerRef.current = null
    }
  }, [isLive, live.ivsPlaybackUrl])

  // Syncs the player's audio state with the mute toggle without recreating
  // the player instance (that would restart playback).
  useEffect(() => {
    playerRef.current?.setMuted(muted)
  }, [muted])

  // Registers this viewer with the backend so it's reflected in the live's
  // viewer count (pushed back to every client via the RTM `viewer-count`
  // system message that useLiveChat listens for).
  useEffect(() => {
    if (live.status !== 'LIVE') return
    const viewerId = getOrCreateViewerId()
    void sendLiveHeartbeat(live.id, viewerId)
    const interval = setInterval(() => void sendLiveHeartbeat(live.id, viewerId), HEARTBEAT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [live.id, live.status])

  const showFallback = !isLive || playbackError

  return (
    <div className={`live-feed-stage${showFallback ? ' live-feed-fallback-bg' : ''}`}>
      {isLive && !playbackError ? (
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          poster={live.thumbnailUrl ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="text-[13px] text-white/70 text-center">Este live no está disponible ahora mismo.</p>
        </div>
      )}

      <div className="live-feed-overlay" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-5 z-10">
        <button className="live-feed-icon-btn" onClick={() => router.push('/buyer/lives')} aria-label="Cerrar">
          ✕
        </button>
        <div className="flex items-center gap-2">
          <button className="live-feed-icon-btn" onClick={toggleMute} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
            <SpeakerIcon muted={muted} />
          </button>
          <button className="live-feed-icon-btn" aria-label="Buscar">🔍</button>
        </div>
      </div>

      {isLive && !playbackError && (
        <div className="absolute top-16 left-4 z-10">
          <span className="live-badge">
            <span className="dot" />
            En vivo
          </span>
        </div>
      )}

      <div className="live-feed-badge absolute top-16 right-4 z-10">👁 {formattedViewers}</div>

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
        <div className="min-w-0">
          <p className="font-display font-bold text-[15px] text-white truncate max-w-64">{live.title}</p>
        </div>
        <button className="bg-white text-[#1a0612] text-[13px] font-bold px-5 py-2 rounded-full shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          Seguir
        </button>
      </div>

      {pinnedProduct && (
        <div className="absolute left-4 right-4 bottom-12 z-10">
          <div className="live-feed-pinned-card">
            <div
              className="live-feed-pinned-thumb"
              style={{
                background: pinnedProduct.imageUrl
                  ? `url(${pinnedProduct.imageUrl}) center/cover no-repeat`
                  : PINNED_THUMB_BG,
              }}
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="live-feed-pinned-badge">Anclado</span>
              <p className="text-[13px] font-bold text-white truncate">{pinnedProduct.productNameSnapshot}</p>
              <p className="text-[13px] font-bold text-brand-400">
                ${pinnedProduct.priceSnapshot.toLocaleString('es-MX')} {pinnedProduct.currencySnapshot}
              </p>
            </div>
            <button className="live-launch-btn shrink-0">Comprar</button>
          </div>
        </div>
      )}

      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/50 z-10">
        ↑ desliza para el siguiente live
      </p>
    </div>
  )
}
