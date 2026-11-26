// Chat message model and pure state transitions shared by both transports.
import type { ChatHistoryMessage, ChatProvider } from '@/lib/liveActions'

export type ChatMessage = {
  id: string
  /** Provider message id (IVS message id / Agora id from history). Null for
   * Agora realtime and optimistic messages. Used for dedupe and deletion. */
  providerMessageId: string | null
  userId: string
  username: string
  content: string
  sentAt: string
  color: string
  isOwn: boolean
  isHost: boolean
}

/** Max message length: the IVS room's maximumMessageLength (Unicode code
 * points); Agora lives keep the backend's 300 limit. */
const MAX_MESSAGE_LENGTH: Record<ChatProvider, number> = { ivs: 500, agora: 300 }

export function chatMaxMessageLength(provider: ChatProvider): number {
  return MAX_MESSAGE_LENGTH[provider]
}

/** Trims and cuts to `max` code points (IVS counts code points, and a plain
 * slice could split a surrogate pair). */
export function truncateChatText(text: string, max: number): string {
  const trimmed = text.trim()
  const points = Array.from(trimmed)
  return points.length <= max ? trimmed : points.slice(0, max).join('').trimEnd()
}

let localIdSeq = 0

/** Collision-free id for messages without a provider id (also used as React key). */
function localMessageId(prefix: string): string {
  localIdSeq += 1
  return `${prefix}-${Date.now()}-${localIdSeq}`
}

export const OWN_MESSAGE_COLOR = '#ff3d96'
const USER_COLORS = ['#a78bfa', '#22d3ee', '#ff3d96', '#4ade80', '#fbbf24', '#fb923c']
const UUID = /^[0-9a-f-]{36}$/i
const OWN_LABEL = 'Tú'
const FALLBACK_NAME = 'Usuario'

export function colorForUserId(userId: string): string {
  let hash = 0
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return USER_COLORS[hash % USER_COLORS.length]
}

function displayUsername(username: string): string {
  if (UUID.test(username)) return `${FALLBACK_NAME} ${username.slice(0, 8)}`
  return username || FALLBACK_NAME
}

export type HistoryContext = {
  selfUserId: string
  sellerId?: string
}

function sentAtMs(m: { sentAt: string }): number {
  const ms = Date.parse(m.sentAt)
  return Number.isNaN(ms) ? 0 : ms
}

function byTime(a: ChatMessage, b: ChatMessage): number {
  return sentAtMs(a) - sentAtMs(b)
}

/** Maps a history page (backend returns newest-first) to chronological order. */
export function mapHistoryMessages(messages: readonly ChatHistoryMessage[], ctx: HistoryContext): ChatMessage[] {
  return messages
    .map((m): ChatMessage => {
      const isOwn = m.userId === ctx.selfUserId || m.username === ctx.selfUserId
      return {
        id: m.id,
        providerMessageId: m.providerMessageId,
        userId: m.userId,
        username: isOwn ? OWN_LABEL : displayUsername(m.username),
        content: m.content,
        sentAt: m.sentAt,
        color: colorForUserId(m.userId),
        isOwn,
        isHost: !!ctx.sellerId && m.userId === ctx.sellerId,
      }
    })
    .sort(byTime)
}

/** Structural subset of the IVS SDK `ChatMessage`. */
export type IvsMessageLike = {
  id: string
  content: string
  sendTime: Date
  sender: { userId: string; attributes?: Record<string, string> }
}

export function mapIvsMessage(message: IvsMessageLike, selfUserId: string): ChatMessage {
  const { userId, attributes } = message.sender
  const isOwn = userId === selfUserId
  const displayName = attributes?.displayName?.trim()
  return {
    id: message.id,
    providerMessageId: message.id,
    userId,
    username: isOwn ? OWN_LABEL : displayName || FALLBACK_NAME,
    content: message.content,
    sentAt: message.sendTime.toISOString(),
    color: colorForUserId(userId),
    isOwn,
    isHost: attributes?.role === 'SELLER',
  }
}

/** Agora realtime messages only carry the RTM member id. */
export function mapAgoraMessage(text: string, memberId: string, selfUserId: string): ChatMessage {
  const isOwn = memberId === selfUserId
  return {
    id: localMessageId(`rtm-${memberId}`),
    providerMessageId: null,
    userId: memberId,
    username: isOwn ? OWN_LABEL : displayUsername(memberId),
    content: text,
    sentAt: new Date().toISOString(),
    color: colorForUserId(memberId),
    isOwn,
    isHost: false,
  }
}

export function optimisticOwnMessage(text: string, selfUserId: string): ChatMessage {
  return {
    id: localMessageId('own'),
    providerMessageId: null,
    userId: selfUserId || 'self',
    username: OWN_LABEL,
    content: text,
    sentAt: new Date().toISOString(),
    color: OWN_MESSAGE_COLOR,
    isOwn: true,
    isHost: false,
  }
}

/** Merges messages deduping on providerMessageId (messages without one are
 * always kept), in chronological order. Returns `prev` when nothing is new. */
export function mergeChatMessages(prev: ChatMessage[], incoming: readonly ChatMessage[]): ChatMessage[] {
  const seen = new Set(prev.flatMap((m) => (m.providerMessageId ? [m.providerMessageId] : [])))
  const fresh: ChatMessage[] = []
  for (const m of incoming) {
    if (m.providerMessageId) {
      if (seen.has(m.providerMessageId)) continue
      seen.add(m.providerMessageId)
    }
    fresh.push(m)
  }
  if (fresh.length === 0) return prev
  return [...prev, ...fresh].sort(byTime)
}

/** Appends one realtime message at the end (no reordering); dedupes only on a
 * non-null providerMessageId. */
export function appendChatMessage(prev: ChatMessage[], message: ChatMessage): ChatMessage[] {
  const key = message.providerMessageId
  if (key && prev.some((m) => m.providerMessageId === key)) return prev
  return [...prev, message]
}

export function removeChatMessage(prev: ChatMessage[], messageId: string): ChatMessage[] {
  const next = prev.filter((m) => m.providerMessageId !== messageId && m.id !== messageId)
  return next.length === prev.length ? prev : next
}

/**
 * Agora reconnect gap fill (unchanged legacy behavior): when history brings
 * anything new, replace the list with it and keep only the optimistic own
 * messages whose content the server has not stored yet.
 */
export function applyAgoraHistoryGap(prev: ChatMessage[], incoming: readonly ChatMessage[]): ChatMessage[] {
  const existingIds = new Set(prev.filter((m) => !m.id.startsWith('own-')).map((m) => m.id))
  const gap = incoming.filter((m) => !existingIds.has(m.id))
  if (gap.length === 0) return prev

  const serverContents = new Set(incoming.map((m) => m.content))
  const pendingOwn = prev.filter((m) => m.id.startsWith('own-') && !serverContents.has(m.content))
  return [...incoming, ...pendingOwn]
}
