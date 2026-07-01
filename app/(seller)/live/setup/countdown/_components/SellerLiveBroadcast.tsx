'use client'

import { useEffect, useRef, useState } from 'react'
import type { ICameraVideoTrack } from 'agora-rtc-sdk-ng'
import { expirePinLiveProduct, type LiveResponse } from '@/lib/liveActions'
import {
  useLiveChat,
  type ProductPinnedEvent,
  type StockUpdateEvent,
  type ProductExpiredEvent,
} from '@/hooks/useLiveChat'
import { LiveStockDrawer, type LiveProduct } from './LiveStockDrawer'
import { LiveAddProductDrawer } from './LiveAddProductDrawer'
import { ProductCountdown } from './ProductCountdown'

export type SellerLiveBroadcastProps = {
  live: LiveResponse
  videoTrack: ICameraVideoTrack | null
  storeName: string
  onEnd: () => void
}

export function SellerLiveBroadcast({ live, videoTrack, storeName, onEnd }: SellerLiveBroadcastProps) {
  const [replyText,      setReplyText]      = useState('')
  const [revenue]                           = useState(15800)
  const [stockOpen,      setStockOpen]      = useState(false)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [featured,       setFeatured]       = useState<LiveProduct | null>(null)

  const { messages, sendMessage, isConnected, isSending, viewerCount } = useLiveChat(live.id, {
    onStockUpdate: ({ liveProductId, stockRemaining }: StockUpdateEvent) => {
      setFeatured((prev) =>
        prev?.id === liveProductId ? { ...prev, stock: stockRemaining } : prev,
      )
    },
    onProductPinned: (_event: ProductPinnedEvent) => {
      // Seller already sees the pinned product via the local onLaunch callback.
      // This event is primarily for buyer clients.
    },
    onProductExpired: ({ liveProductId }: ProductExpiredEvent) => {
      setFeatured((prev) => (prev?.id === liveProductId ? null : prev))
    },
  })

  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoTrack) return
    videoTrack.play('agora-live-video', { fit: 'cover' })
  }, [videoTrack])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleCountdownExpire() {
    if (!featured) return
    void expirePinLiveProduct(live.id, featured.id)
    setFeatured(null)
  }

  async function handleSend() {
    if (!replyText.trim() || isSending) return
    const text = replyText
    setReplyText('')
    await sendMessage(text)
  }

  const formattedViewers = viewerCount === null
    ? '—'
    : viewerCount >= 1000
      ? `${(viewerCount / 1000).toFixed(1)}k`
      : String(viewerCount)

  const formattedRevenue = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(revenue)

  return (
    <div className="seller-live-stage">

      {/* Agora full-screen video */}
      <div id="agora-live-video" className="seller-live-video" />

      {/* Gradient overlays for UI legibility */}
      <div className="seller-live-top-fade" />
      <div className="seller-live-bottom-fade" />

      {/* ── Header ── */}
      <div className="seller-live-header">
        <div className="seller-live-store-row">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2.8" fill="#ff1f87" />
          </svg>
          <span className="seller-live-store-name">{storeName}</span>
          <span className="seller-live-badge">LIVE</span>
        </div>
        <button className="seller-live-close" onClick={onEnd} aria-label="Terminar live">
          ✕
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="seller-live-stats">
        <div className="seller-live-stat">
          <svg width="15" height="10" viewBox="0 0 15 10" fill="none" aria-hidden>
            <path
              d="M7.5 1C4.2 1 1.5 4.2 1 5c.5.8 3.2 4 6.5 4s6-3.2 6.5-4C13.5 4.2 10.8 1 7.5 1Z"
              stroke="currentColor" strokeWidth="1.2" fill="none"
            />
            <circle cx="7.5" cy="5" r="2" fill="currentColor" />
          </svg>
          {formattedViewers}
        </div>
        <div className="seller-live-stat-divider" />
        <div className="seller-live-stat">{formattedRevenue}</div>
      </div>

      {/* ── Right side controls ── */}
      <div className="seller-live-controls">
        <button className="seller-live-ctrl-btn" aria-label="Reacciones">❤️</button>
        <button
          className="seller-live-ctrl-btn"
          aria-label="Lista de productos"
          onClick={() => setStockOpen(true)}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
            <rect x="1" y="1" width="18" height="2" rx="1" fill="white" />
            <rect x="1" y="6" width="14" height="2" rx="1" fill="white" />
            <rect x="1" y="11" width="10" height="2" rx="1" fill="white" />
          </svg>
        </button>
      </div>

      {/* ── Chat messages ── */}
      <div className="seller-live-chat" aria-live="polite" aria-label="Chat de la transmisión">
        {messages.length === 0 && (
          <div className="seller-live-msg">
            <span className="seller-live-msg-text" style={{ opacity: 0.45 }}>
              {isConnected ? 'Aún no hay mensajes.' : 'Esperando mensajes...'}
            </span>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="seller-live-msg">
            <span className="seller-live-msg-user" style={{ color: msg.color }}>
              {msg.username}
            </span>
            <span className="seller-live-msg-text">{msg.content}</span>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* ── Product showcase (visible only after first LANZAR) ── */}
      {featured && (
        <div className="seller-live-product">
          <div className="seller-live-product-thumb" aria-hidden>
            {featured.imageUrl ? (
              <img
                src={featured.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              '📦'
            )}
          </div>
          <div className="seller-live-product-info">
            <div className="seller-live-product-name-row">
              <span className="seller-live-product-name">{featured.name}</span>
              <span className="seller-live-now-badge">NOW</span>
            </div>
            <div className="seller-live-product-price">
              ${featured.price.toLocaleString('es-MX')} <span>{featured.currency}</span>
            </div>
            <ProductCountdown
              key={featured.id}
              durationSeconds={live.displayDurationSeconds}
              onExpire={handleCountdownExpire}
            />
          </div>
          <button
            className="seller-live-next-btn"
            aria-label="Gestionar productos"
            onClick={() => setStockOpen(true)}
          >
            SIGUIENTE &rsaquo;
          </button>
        </div>
      )}

      {/* ── Live stock drawer ── */}
      <LiveStockDrawer
        liveId={live.id}
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        onLaunch={(product) => setFeatured(product)}
        onAddProduct={() => { setStockOpen(false); setAddProductOpen(true) }}
      />

      {/* ── Add product in live drawer ── */}
      <LiveAddProductDrawer
        liveId={live.id}
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSave={(product) => { setFeatured(product); setAddProductOpen(false) }}
      />

      {/* ── Input bar ── */}
      <div className="seller-live-input-bar">
        <input
          type="text"
          className="seller-live-input"
          placeholder="Responde a tu audiencia..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          aria-label="Responder al chat"
          disabled={isSending}
        />
        <button className="seller-live-emoji-btn" aria-label="Emoji" type="button">
          😊
        </button>
        <button
          className="seller-live-send-btn"
          aria-label="Enviar mensaje"
          type="button"
          onClick={handleSend}
          disabled={isSending || !replyText.trim()}
        >
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" aria-hidden>
            <path
              d="M2.5 8H14.5M14.5 8L9.5 3M14.5 8L9.5 13"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
