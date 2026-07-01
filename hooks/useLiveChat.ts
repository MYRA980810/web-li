'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getChatToken, getChatHistory, type ChatHistoryMessage } from '@/lib/liveActions'

const USER_COLORS = ['#a78bfa', '#22d3ee', '#ff3d96', '#4ade80', '#fbbf24', '#fb923c']

function colorForUserId(userId: string): string {
  let hash = 0
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return USER_COLORS[hash % USER_COLORS.length]
}

function displayUsername(username: string, rtmUid: string): string {
  if (username === rtmUid) return 'Tú'
  if (/^[0-9a-f-]{36}$/i.test(username)) return `Usuario ${username.slice(0, 8)}`
  return username
}

// ── RTM system message shapes ─────────────────────────────────────────────────

export type ProductPinnedEvent = {
  liveProductId: string
  productName: string
  price: number
  displayDurationSeconds: number
}

export type StockUpdateEvent = {
  liveProductId: string
  stockRemaining: number
}

export type ProductExpiredEvent = {
  liveProductId: string
  status: 'AVAILABLE' | 'SOLD'
}

// ── Public types ──────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string
  userId: string
  username: string
  content: string
  sentAt: string
  color: string
}

export type UseLiveChatOptions = {
  onProductPinned?:  (event: ProductPinnedEvent)  => void
  onStockUpdate?:    (event: StockUpdateEvent)    => void
  onProductExpired?: (event: ProductExpiredEvent) => void
}

type UseLiveChatReturn = {
  messages:    ChatMessage[]
  sendMessage: (text: string) => Promise<void>
  isConnected: boolean
  isSending:   boolean
  viewerCount: number | null
}

function mapHistory(msg: ChatHistoryMessage, rtmUid: string): ChatMessage {
  return {
    id:       msg.id,
    userId:   msg.userId,
    username: displayUsername(msg.username, rtmUid),
    content:  msg.content,
    sentAt:   msg.sentAt,
    color:    colorForUserId(msg.userId),
  }
}

function handleSystemMessage(
  text: string,
  memberId: string,
  options: UseLiveChatOptions,
  setViewerCount: React.Dispatch<React.SetStateAction<number | null>>,
): boolean {
  if (memberId !== 'live-server') return false

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(text) as Record<string, unknown>
  } catch {
    return false
  }

  const type = payload.type as string | undefined
  if (!type) return false

  switch (type) {
    case 'viewer-count':
      setViewerCount(payload.count as number)
      return true
    case 'product-pinned':
      options.onProductPinned?.({
        liveProductId:          payload.liveProductId          as string,
        productName:            payload.productName            as string,
        price:                  payload.price                  as number,
        displayDurationSeconds: payload.displayDurationSeconds as number,
      })
      return true
    case 'stock-update':
      options.onStockUpdate?.({
        liveProductId:  payload.liveProductId  as string,
        stockRemaining: payload.stockRemaining as number,
      })
      return true
    case 'product-expired':
      options.onProductExpired?.({
        liveProductId: payload.liveProductId as string,
        status:        payload.status        as 'AVAILABLE' | 'SOLD',
      })
      return true
    default:
      return true
  }
}

export function useLiveChat(liveId: string, options: UseLiveChatOptions = {}): UseLiveChatReturn {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSending,   setIsSending]   = useState(false)
  const [viewerCount, setViewerCount] = useState<number | null>(null)

  const channelRef  = useRef<unknown>(null)
  const clientRef   = useRef<unknown>(null)
  const rtmUidRef   = useRef('')
  const optionsRef  = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    let isMounted = true

    async function fillGap() {
      const result = await getChatHistory(liveId)
      if (!isMounted || !result.ok) return

      setMessages((prev) => {
        const existingIds = new Set(
          prev.filter((m) => !m.id.startsWith('own-')).map((m) => m.id),
        )
        const incoming = result.messages.map((m) => mapHistory(m, rtmUidRef.current))
        const gap      = incoming.filter((m) => !existingIds.has(m.id))

        if (gap.length === 0) return prev

        const serverContents = new Set(incoming.map((m) => m.content))
        const pendingOwn     = prev.filter(
          (m) => m.id.startsWith('own-') && !serverContents.has(m.content),
        )
        return [...incoming, ...pendingOwn]
      })
    }

    async function connect() {
      const tokenResult = await getChatToken(liveId)
      if (!isMounted || !tokenResult.ok) return

      const { token, channelName, appId, rtmUid } = tokenResult.data
      rtmUidRef.current = rtmUid

      // Initial history load — one single request on mount
      const historyResult = await getChatHistory(liveId)
      if (!isMounted) return
      if (historyResult.ok) {
        setMessages(historyResult.messages.map((m) => mapHistory(m, rtmUid)))
      }

      const mod = await import('agora-rtm-sdk')
      const AgoraRTM = (mod.default ?? mod) as any
      if (!isMounted) return

      const client = AgoraRTM.createInstance
        ? AgoraRTM.createInstance(appId)
        : new AgoraRTM(appId)
      clientRef.current = client

      // Track previous RTM state to detect reconnection (RECONNECTING → CONNECTED)
      let prevRtmState = 'CONNECTING'
      client.on('ConnectionStateChanged', async (newState: string) => {
        if (!isMounted) return

        const wasReconnecting = prevRtmState === 'RECONNECTING'
        prevRtmState = newState

        setIsConnected(newState === 'CONNECTED')

        if (newState === 'CONNECTED' && wasReconnecting) {
          // Reconnected after a drop — fetch latest history once to fill the gap
          await fillGap()
        }
      })

      try {
        await (client as any).login({ uid: rtmUid, token })
      } catch {
        return
      }
      if (!isMounted) return

      const channel = (client as any).createChannel(channelName)
      channelRef.current = channel

      channel.on('ChannelMessage', (message: { text: string }, memberId: string) => {
        if (!isMounted) return

        const handled = handleSystemMessage(
          message.text,
          memberId,
          optionsRef.current,
          setViewerCount,
        )
        if (handled) return

        setMessages((prev) => [
          ...prev,
          {
            id:       `rtm-${memberId}-${Date.now()}`,
            userId:   memberId,
            username: displayUsername(memberId, rtmUidRef.current),
            content:  message.text,
            sentAt:   new Date().toISOString(),
            color:    colorForUserId(memberId),
          },
        ])
      })

      try {
        await channel.join()
        if (isMounted) setIsConnected(true)
      } catch {
        // RTM unavailable — UI shows history-only
      }
    }

    connect()

    return () => {
      isMounted = false
      const ch = channelRef.current as any
      const cl = clientRef.current as any
      channelRef.current = null
      clientRef.current  = null
      if (ch) ch.leave().catch(() => {})
      if (cl) cl.logout().catch(() => {})
      setIsConnected(false)
    }
  }, [liveId])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id:       `own-${Date.now()}`,
        userId:   rtmUidRef.current || 'self',
        username: 'Tú',
        content:  text.trim(),
        sentAt:   new Date().toISOString(),
        color:    '#ff3d96',
      },
    ])

    const channel = channelRef.current as any
    if (!channel) return

    setIsSending(true)
    try {
      await channel.sendMessage({ text: text.trim() })
    } catch {
      // RTM send failed — message already shown locally
    } finally {
      setIsSending(false)
    }
  }, [])

  return { messages, sendMessage, isConnected, isSending, viewerCount }
}
