'use client'

import { useEffect, useRef, useState } from 'react'
import { expirePinLiveProduct, type LiveResponse } from '@/lib/liveActions'
import {
  useLiveChat,
  type ProductPinnedEvent,
  type StockUpdateEvent,
  type ProductExpiredEvent,
  type ChatMessage,
} from '@/hooks/useLiveChat'
import { useChatBans } from '@/hooks/useChatBans'
import { ChatMessageSheet } from './ChatMessageSheet'
import { ChatBansSheet } from './ChatBansSheet'
import { LiveStockDrawer, type LiveProduct } from './LiveStockDrawer'
import { LiveAddProductDrawer } from './LiveAddProductDrawer'
import { LiveCatalogProductDrawer } from './LiveCatalogProductDrawer'
import { ProductCountdown } from './ProductCountdown'
import type { ProductView, Category } from '@/lib/types'

export type SellerLiveBroadcastProps = {
  live: LiveResponse
  stream: MediaStream | null
  storeName: string
  onEnd: () => void
  products: ProductView[]
  categories: Category[]
}

export function SellerLiveBroadcast({ live, stream, storeName, onEnd, products, categories }: SellerLiveBroadcastProps) {
  const [replyText,      setReplyText]      = useState('')
  const [revenue]                           = useState(15800)
  const [stockOpen,      setStockOpen]      = useState(false)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [catalogOpen,    setCatalogOpen]    = useState(false)
  const [featured,       setFeatured]       = useState<LiveProduct | null>(null)

  const [moderationError, setModerationError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  /** Non-null while the "Bloqueados" sheet is open (relative times use it). */
  const [bansOpenedAt,    setBansOpenedAt]    = useState<number | null>(null)

  const {
    messages,
    sendMessage,
    isConnected,
    isSending,
    viewerCount,
    chatProvider,
    sendError,
    maxMessageLength,
    deleteMessage,
    banUser,
  } = useLiveChat(live.id, live.chatProvider, {
    sellerId: live.sellerId,
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

  const canModerate = chatProvider === 'ivs'
  const chatBans    = useChatBans(live.id, canModerate)

  const chatBottomRef        = useRef<HTMLDivElement>(null)
  const videoRef             = useRef<HTMLVideoElement>(null)
  const moderationErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (moderationErrorTimer.current !== null) clearTimeout(moderationErrorTimer.current)
  }, [])

  function showModerationError(error: string) {
    if (moderationErrorTimer.current !== null) clearTimeout(moderationErrorTimer.current)
    setModerationError(error)
    moderationErrorTimer.current = setTimeout(() => setModerationError(null), 4000)
  }

  useEffect(() => {
    if (!stream || !videoRef.current) return
    videoRef.current.srcObject = stream
  }, [stream])

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
    const sent = await sendMessage(text)
    // Restore the draft when IVS rejected it (sendError explains why).
    if (!sent) setReplyText(text)
  }

  async function handleBan(message: ChatMessage) {
    const result = await banUser(message.userId)
    if (result.ok) {
      chatBans.recordBan({
        userId:      message.userId,
        displayName: message.username,
        bannedAt:    new Date().toISOString(),
      })
      setSelectedMessage(null)
      if (result.notice) showModerationError(result.notice)
    }
    return result
  }

  async function handleDeleteMessage(message: ChatMessage) {
    const result = await deleteMessage(message)
    if (result.ok) setSelectedMessage(null)
    return result
  }

  function openBans() {
    setBansOpenedAt(Date.now())
    chatBans.refresh()
  }

  const chatNotice = sendError ?? moderationError

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

      {/* Full-screen camera preview */}
      <video ref={videoRef} muted autoPlay playsInline className="seller-live-video object-cover" />

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
        <div className="flex items-center gap-2.5">
          {canModerate && (
            <button
              type="button"
              className="seller-live-shield-btn"
              onClick={openBans}
              aria-label={`Usuarios bloqueados (${chatBans.bans.length})`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
                />
                <path d="M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {chatBans.bans.length > 0 && (
                <span className="seller-live-shield-count" aria-hidden="true">
                  {chatBans.bans.length > 99 ? '99+' : chatBans.bans.length}
                </span>
              )}
            </button>
          )}
          <button className="seller-live-close" onClick={onEnd} aria-label="Terminar live">
            ✕
          </button>
        </div>
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
      <div className="seller-live-chat-panel">
        {canModerate && (
          <div className="flex items-center justify-between gap-3 px-3.5 pb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-(--ink-3)">Chat en vivo</span>
            <span className="text-[11px] font-semibold text-(--ink-3)">Toca un mensaje para moderar</span>
          </div>
        )}
        <div className="seller-live-chat" aria-live="polite" aria-label="Chat de la transmisión">
          {messages.length === 0 && (
            <div className="seller-live-msg">
              <span className="seller-live-msg-text" style={{ opacity: 0.45 }}>
                {isConnected ? 'Aún no hay mensajes.' : 'Esperando mensajes...'}
              </span>
            </div>
          )}
          {messages.map((msg) => {
            const content = (
              <>
                <span className="seller-live-msg-user" style={{ color: msg.color }}>
                  {msg.username}
                </span>
                {msg.isHost && <span className="seller-live-msg-role">Anfitrión</span>}
                <span className="seller-live-msg-text">{msg.content}</span>
              </>
            )
            // Only other users' messages are moderable, and only on IVS chat.
            if (canModerate && !msg.isOwn && !msg.isHost) {
              return (
                <button
                  key={msg.id}
                  type="button"
                  className="seller-live-msg is-tappable text-left"
                  onClick={() => setSelectedMessage(msg)}
                  aria-label={`Moderar mensaje de ${msg.username}: ${msg.content}`}
                >
                  {content}
                </button>
              )
            }
            return (
              <div key={msg.id} className={`seller-live-msg${msg.isHost ? ' is-mod' : ''}`}>
                {content}
              </div>
            )
          })}
          {chatNotice && (
            <div className="seller-live-msg" role="alert">
              <span className="text-[13px] font-semibold text-red-300">{chatNotice}</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* ── Moderation sheets (IVS only, mounted on tap) ── */}
      {canModerate && selectedMessage && (
        <ChatMessageSheet
          key={selectedMessage.id}
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onBan={handleBan}
          onDelete={handleDeleteMessage}
        />
      )}
      {canModerate && bansOpenedAt !== null && (
        <ChatBansSheet
          bans={chatBans.bans}
          status={chatBans.status}
          error={chatBans.error}
          now={bansOpenedAt}
          onClose={() => setBansOpenedAt(null)}
          onRetry={chatBans.refresh}
          onUnban={chatBans.unban}
        />
      )}

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
        onAddCatalogProduct={() => { setStockOpen(false); setCatalogOpen(true) }}
      />

      {/* ── Add product in live drawer ── */}
      <LiveAddProductDrawer
        liveId={live.id}
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSave={(product) => { setFeatured(product); setAddProductOpen(false) }}
      />

      {/* ── Add catalog product to live drawer ── */}
      <LiveCatalogProductDrawer
        liveId={live.id}
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        products={products}
        categories={categories}
        onAdded={() => { setCatalogOpen(false); setStockOpen(true) }}
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
          maxLength={maxMessageLength}
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
