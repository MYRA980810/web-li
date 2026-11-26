'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  banChatUser,
  deleteChatMessage,
  getChatHistory,
  getIvsChatToken,
  type ChatModerationResult,
  type ChatProvider,
} from '@/lib/liveActions'
import {
  appendChatMessage,
  chatMaxMessageLength,
  truncateChatText,
  applyAgoraHistoryGap,
  mapHistoryMessages,
  mergeChatMessages,
  removeChatMessage,
  type ChatMessage,
} from '@/lib/liveChat/chatMessages'
import { SEND_PENDING_MESSAGE, isSendForbiddenError, sendErrorMessage } from '@/lib/liveChat/chatErrors'
import { createAgoraChatTransport } from '@/lib/liveChat/agoraChatTransport'
import { createIvsChatTransport } from '@/lib/liveChat/ivsChatTransport'
import type { ChatTransport, ChatTransportHandlers } from '@/lib/liveChat/chatTransport'
import type {
  LiveEndedEvent,
  LiveReconnectingEvent,
  ProductExpiredEvent,
  ProductPinnedEvent,
  RoomEvent,
  StockUpdateEvent,
} from '@/lib/liveChat/roomEvents'

export type { ChatMessage } from '@/lib/liveChat/chatMessages'
export type {
  LiveEndedEvent,
  LiveReconnectingEvent,
  ProductExpiredEvent,
  ProductPinnedEvent,
  StockUpdateEvent,
} from '@/lib/liveChat/roomEvents'

const SEND_ERROR_VISIBLE_MS = 4000
const NETWORK_ERROR = 'No se pudo conectar con el servidor'

export type UseLiveChatOptions = {
  onProductPinned?:    (event: ProductPinnedEvent)    => void
  onStockUpdate?:      (event: StockUpdateEvent)      => void
  onProductExpired?:   (event: ProductExpiredEvent)   => void
  onLiveReconnecting?: (event: LiveReconnectingEvent) => void
  /** IVS only: the live ended and its chat room is being deleted. */
  onLiveEnded?:        (event: LiveEndedEvent)        => void
  /** Live owner id, used to flag history messages from the host. */
  sellerId?: string
}

export type UseLiveChatReturn = {
  messages:     ChatMessage[]
  /** Resolves false when the message was not accepted (see sendError); true
   * when sent or probably sent (timeout, with a soft notice in sendError). */
  sendMessage:  (text: string) => Promise<boolean>
  isConnected:  boolean
  isSending:    boolean
  viewerCount:  number | null
  chatProvider: ChatProvider
  /** Last send rejection (IVS), cleared automatically after a few seconds. */
  sendError:    string | null
  /** False when the seller banned the current user: the chat stays readable
   * (receive-only token) but sending is disabled. Always true for Agora. */
  canSend:      boolean
  /** Reconnects exhausted; retried automatically when back online / visible. */
  isChatLost:   boolean
  /** Per-provider limit: 500 (IVS) / 300 (Agora). */
  maxMessageLength: number
  /** Seller moderation (IVS only). */
  deleteMessage: (message: ChatMessage) => Promise<ChatModerationResult>
  banUser:       (userId: string) => Promise<ChatModerationResult>
}

export function resolveChatProvider(chatProvider: ChatProvider | null | undefined): ChatProvider {
  return chatProvider === 'ivs' ? 'ivs' : 'agora'
}

export function useLiveChat(
  liveId: string,
  chatProvider: ChatProvider | null | undefined,
  options: UseLiveChatOptions = {},
): UseLiveChatReturn {
  const provider = resolveChatProvider(chatProvider)

  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSending,   setIsSending]   = useState(false)
  const [viewerCount, setViewerCount] = useState<number | null>(null)
  const [sendError,   setSendError]   = useState<string | null>(null)
  const [canSend,     setCanSend]     = useState(true)
  const [isChatLost,  setIsChatLost]  = useState(false)
  const maxMessageLength = chatMaxMessageLength(provider)

  const transportRef      = useRef<ChatTransport | null>(null)
  const sendErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const optionsRef        = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    let selfUserId = ''

    function dispatchRoomEvent(event: RoomEvent) {
      const opts = optionsRef.current
      switch (event.type) {
        case 'viewer-count':      setViewerCount(event.count); break
        case 'product-pinned':    opts.onProductPinned?.(event.event); break
        case 'stock-update':      opts.onStockUpdate?.(event.event); break
        case 'product-expired':   opts.onProductExpired?.(event.event); break
        case 'live-reconnecting': opts.onLiveReconnecting?.(event.event); break
        case 'live-ended':        opts.onLiveEnded?.(event.event); break
      }
    }

    const handlers: ChatTransportHandlers = {
      onIdentity: (id) => { selfUserId = id },
      loadHistory: async (mode) => {
        const result = await getChatHistory(liveId).catch(() => null)
        if (!result?.ok || transportRef.current !== transport) return
        const incoming = mapHistoryMessages(result.messages, {
          selfUserId,
          sellerId: optionsRef.current.sellerId,
        })
        if (provider === 'ivs') setMessages((prev) => mergeChatMessages(prev, incoming))
        else if (mode === 'initial') setMessages(incoming)
        else setMessages((prev) => applyAgoraHistoryGap(prev, incoming))
      },
      onMessage: (message) => setMessages((prev) => appendChatMessage(prev, message)),
      onRoomEvent: dispatchRoomEvent,
      onMessageDeleted: (messageId) => setMessages((prev) => removeChatMessage(prev, messageId)),
      onConnectionChange: (connected) => {
        setIsConnected(connected)
        if (connected) setIsChatLost(false)
      },
      onSendPermission: setCanSend,
      onGaveUp: () => setIsChatLost(true),
    }

    const transport = provider === 'ivs'
      ? createIvsChatTransport(liveId, handlers, { requestToken: getIvsChatToken })
      : createAgoraChatTransport(liveId, handlers)
    transportRef.current = transport
    transport.connect()

    return () => {
      if (transportRef.current === transport) transportRef.current = null
      transport.disconnect()
      setIsConnected(false)
      setCanSend(true)
    }
  }, [liveId, provider])

  useEffect(() => () => {
    if (sendErrorTimerRef.current !== null) clearTimeout(sendErrorTimerRef.current)
  }, [])

  const showSendError = useCallback((text: string | null) => {
    if (sendErrorTimerRef.current !== null) clearTimeout(sendErrorTimerRef.current)
    sendErrorTimerRef.current = null
    setSendError(text)
    if (text !== null) {
      sendErrorTimerRef.current = setTimeout(() => setSendError(null), SEND_ERROR_VISIBLE_MS)
    }
  }, [setSendError])

  const sendMessage = useCallback(async (raw: string) => {
    const text = truncateChatText(raw, maxMessageLength)
    const transport = transportRef.current
    if (!text || !transport) return false

    showSendError(null)
    setIsSending(true)
    try {
      const outcome = await transport.send(text)
      // Timed out: probably sent, so the caller clears the draft (a resend
      // would duplicate it) and the user gets a soft notice instead.
      if (outcome === 'pending') showSendError(SEND_PENDING_MESSAGE)
      return true
    } catch (err) {
      if (isSendForbiddenError(err)) {
        // Receive-only token (banned) — the input should already be disabled.
        // Log the raw SDK error so e2e runs can capture it.
        console.warn('[live-chat] send rejected: receive-only chat token', err)
        setCanSend(false)
      }
      showSendError(sendErrorMessage(err))
      return false
    } finally {
      setIsSending(false)
    }
  }, [showSendError, maxMessageLength, setIsSending, setCanSend])

  const deleteMessage = useCallback(async (message: ChatMessage): Promise<ChatModerationResult> => {
    const messageId = message.providerMessageId
    if (!messageId) return { ok: false, error: 'Este mensaje no se puede eliminar' }
    const result = await deleteChatMessage(liveId, messageId).catch(
      (): ChatModerationResult => ({ ok: false, error: NETWORK_ERROR }),
    )
    if (result.ok) setMessages((prev) => removeChatMessage(prev, messageId))
    return result
  }, [liveId, setMessages])

  const banUser = useCallback(
    (userId: string): Promise<ChatModerationResult> =>
      banChatUser(liveId, userId).catch((): ChatModerationResult => ({ ok: false, error: NETWORK_ERROR })),
    [liveId],
  )

  return {
    messages,
    sendMessage,
    isConnected,
    isSending,
    viewerCount,
    chatProvider: provider,
    sendError,
    canSend,
    isChatLost,
    maxMessageLength,
    deleteMessage,
    banUser,
  }
}
