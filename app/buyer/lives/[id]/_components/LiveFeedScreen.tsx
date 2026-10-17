'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveChat, type StockUpdateEvent, type ProductExpiredEvent } from '@/hooks/useLiveChat'
import {
  buyLiveProduct,
  getLiveProducts,
  sendLiveHeartbeat,
  type LiveOrderResponse,
  type LiveProductApiResponse,
  type LiveResponse,
} from '@/lib/liveActions'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import { formatMxn } from '@/lib/format'
import { useIvsLivePlayer } from '../_hooks/useIvsLivePlayer'
import { useStoreFollow } from '../_hooks/useStoreFollow'
import {
  cartBagSummary,
  formatFollowerCount,
  formatPlainCount,
  liveOrderSummary,
  stockRemaining,
} from '../_lib/livePlayerView'
import { MOCK_LIVE_LIKE_COUNT } from '../_lib/liveMocks'
import { LiveHeader } from './LiveHeader'
import { LiveActionRail } from './LiveActionRail'
import { LiveAudioControl } from './LiveAudioControl'
import { LiveChatOverlay } from './LiveChatOverlay'
import { LiveChatInput } from './LiveChatInput'
import { NowShowingCard } from './NowShowingCard'
import { LiveBagSheet, type LiveBagTab } from './LiveBagSheet'

const HEARTBEAT_INTERVAL_MS = 15000
const VIEWER_ID_KEY = 'live-viewer-id'
const FEEDBACK_MS = 3000
const SHARE_LABEL = 'Compartir'

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

export type LiveStoreInfo = {
  id: string
  name: string
  logoUrl: string | null
  followerCount: number
}

export type LiveFeedScreenProps = {
  live: LiveResponse | null
  products: LiveProductApiResponse[]
  /** Null for lives without a store (SELLER_PROFILE context) or lookup failure. */
  store: LiveStoreInfo | null
  initialFollowing: boolean
  initialOrder: LiveOrderResponse | null
}

export function LiveFeedScreen({ live, ...rest }: LiveFeedScreenProps) {
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

  return <LiveFeedContent live={live} {...rest} />
}

type FollowSlotProps = {
  store: LiveStoreInfo
  initialFollowing: boolean
  children: (follow: ReturnType<typeof useStoreFollow>) => React.ReactNode
}

/** Hooks can't be conditional, so the follow state lives in a child that
 * only mounts when the live actually has a store. */
function FollowSlot({ store, initialFollowing, children }: FollowSlotProps) {
  const follow = useStoreFollow(store.id, initialFollowing, store.followerCount)
  return <>{children(follow)}</>
}

type LiveFeedContentProps = Omit<LiveFeedScreenProps, 'live'> & { live: LiveResponse }

function LiveFeedContent({ live, products, store, initialFollowing, initialOrder }: LiveFeedContentProps) {
  const router = useRouter()
  const isLive = live.status === 'LIVE' && !!live.ivsPlaybackUrl
  const {
    videoRef,
    playbackError,
    reconnecting,
    muted,
    volume,
    volumeAdjustable,
    audioBlocked,
    playbackBlocked,
    toggleMute,
    changeVolume,
    resumeAudio,
    resumePlayback,
    retry,
  } = useIvsLivePlayer(isLive ? live.ivsPlaybackUrl : null)
  const { groups } = useCart()

  const [liveProducts, setLiveProducts] = useState<LiveProductApiResponse[]>(products)
  const [liveOrder, setLiveOrder] = useState<LiveOrderResponse | null>(initialOrder)
  const [heartbeatViewers, setHeartbeatViewers] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [addFeedback, setAddFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [liked, setLiked] = useState(false)
  const [shareLabel, setShareLabel] = useState(SHARE_LABEL)
  const [bagTab, setBagTab] = useState<LiveBagTab | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const pinnedProduct = liveProducts.find((p) => p.isPinned) ?? null

  const { messages, sendMessage, viewerCount } = useLiveChat(live.id, {
    onProductPinned: () => {
      void getLiveProducts(live.id).then((result) => {
        if (result.ok) setLiveProducts(result.products)
      })
    },
    onStockUpdate: ({ liveProductId, stockRemaining: remaining }: StockUpdateEvent) => {
      setLiveProducts((prev) =>
        prev.map((p) => (p.id === liveProductId ? { ...p, stockSold: p.stockAllocated - remaining } : p)),
      )
    },
    onProductExpired: ({ liveProductId, status }: ProductExpiredEvent) => {
      setLiveProducts((prev) =>
        prev.map((p) => (p.id === liveProductId ? { ...p, isPinned: false, status } : p)),
      )
    },
  })

  // Registers this viewer with the backend so it's reflected in the live's
  // viewer count (pushed back to every client via the RTM `viewer-count`
  // system message that useLiveChat listens for). The heartbeat response also
  // carries the count, used until the first RTM update arrives.
  useEffect(() => {
    if (live.status !== 'LIVE') return
    const viewerId = getOrCreateViewerId()
    const beat = () =>
      void sendLiveHeartbeat(live.id, viewerId).then((result) => {
        if (result.ok) setHeartbeatViewers(result.viewerCount)
      })
    beat()
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [live.id, live.status])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  async function handleAdd() {
    if (!pinnedProduct || adding) return
    setAdding(true)
    setAddFeedback(null)
    const result = await buyLiveProduct(live.id, pinnedProduct.id, 1).catch(() => ({
      ok: false as const,
      error: 'No se pudo conectar con el servidor',
    }))
    setAdding(false)
    if (result.ok) {
      setLiveOrder(result.order)
      setAddFeedback({ tone: 'success', text: 'Agregado a Mis compras' })
    } else {
      setAddFeedback({ tone: 'error', text: result.error })
    }
    later(() => setAddFeedback(null), FEEDBACK_MS)
  }

  async function handleShare() {
    const url = window.location.href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: live.title, url })
      } catch {
        // User dismissed the share sheet.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareLabel('Copiado')
      later(() => setShareLabel(SHARE_LABEL), FEEDBACK_MS)
    } catch {
      // Clipboard unavailable (insecure context) — nothing else to fall back to.
    }
  }

  const cart = cartBagSummary(groups)
  const order = liveOrderSummary(liveOrder)
  const bagCount = cart.lines.length + order.count
  const closeBag = useCallback(() => setBagTab(null), [])

  function openBag() {
    setBagTab(cart.lines.length === 0 && order.count > 0 ? 'orders' : 'cart')
  }

  // The <video> stays mounted for the whole live — even after a fatal player
  // error — so recovery and manual retry can attach a new player to it.
  const showVideo = isLive && !playbackError
  const viewersLabel = formatPlainCount(viewerCount ?? heartbeatViewers)
  const onClose = () => router.push('/buyer/lives')

  const header = (follow: ReturnType<typeof useStoreFollow> | null) => (
    <LiveHeader
      storeName={store?.name ?? 'Tienda'}
      logoUrl={store?.logoUrl ?? null}
      subtitle={follow ? formatFollowerCount(follow.followerCount) : live.title}
      follow={follow ? { following: follow.following, pending: follow.pending, onToggle: follow.toggleFollow } : null}
      onClose={onClose}
      onAir={showVideo}
      viewersLabel={viewersLabel}
    />
  )

  return (
    <div className={`live-feed-stage${showVideo ? '' : ' live-feed-fallback-bg'}`}>
      {isLive && (
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          poster={live.thumbnailUrl ?? undefined}
          className={`absolute inset-0 w-full h-full object-cover${playbackError ? ' invisible' : ''}`}
        />
      )}
      {!isLive && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="text-[13px] text-white/70 text-center">Este live no está disponible ahora mismo.</p>
        </div>
      )}

      <div className="live-feed-overlay" />

      <div className="relative z-10 mx-auto flex h-full max-w-[480px] flex-col gap-3 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)]">
        {store ? (
          <FollowSlot store={store} initialFollowing={initialFollowing}>
            {(follow) => header(follow)}
          </FollowSlot>
        ) : (
          header(null)
        )}

        <div className="flex flex-1 items-center justify-center">
          {isLive && playbackError ? (
            <div role="alert" className="flex flex-col items-center gap-4 px-8">
              <p className="text-[14px] text-white/80 text-center">No pudimos reproducir este live.</p>
              <button type="button" onClick={retry} className="live-player-hint">
                Reintentar
              </button>
            </div>
          ) : showVideo && reconnecting ? (
            <p role="status" className="live-player-hint cursor-default">
              Reconectando…
            </p>
          ) : showVideo && playbackBlocked ? (
            <button type="button" onClick={resumePlayback} className="live-player-hint">
              Toca para reproducir
            </button>
          ) : showVideo && audioBlocked ? (
            <button type="button" onClick={resumeAudio} className="live-player-hint">
              Toca para activar sonido
            </button>
          ) : null}
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 min-w-0">
            <LiveChatOverlay messages={messages} />
          </div>
          <LiveActionRail
            audio={
              <LiveAudioControl
                muted={muted}
                volume={volume}
                adjustable={volumeAdjustable}
                onToggleMute={toggleMute}
                onVolumeChange={changeVolume}
              />
            }
            like={{
              liked,
              countLabel: formatPlainCount(MOCK_LIVE_LIKE_COUNT + (liked ? 1 : 0)),
              onToggle: () => setLiked((v) => !v),
            }}
            share={{ label: shareLabel, onShare: () => void handleShare() }}
            bag={{ count: bagCount, onOpen: openBag }}
          />
        </div>

        {pinnedProduct && (
          <NowShowingCard
            name={pinnedProduct.productNameSnapshot}
            priceLabel={formatMxn(pinnedProduct.priceSnapshot)}
            imageUrl={pinnedProduct.imageUrl}
            remaining={stockRemaining(pinnedProduct)}
            adding={adding}
            feedback={addFeedback}
            onAdd={() => void handleAdd()}
          />
        )}

        <LiveChatInput onSend={(text) => void sendMessage(text)} />
      </div>

      {bagTab && (
        <LiveBagSheet
          initialTab={bagTab}
          cart={cart}
          liveOrder={order}
          onClose={closeBag}
          onCheckout={() => router.push('/buyer/cart')}
        />
      )}
    </div>
  )
}
