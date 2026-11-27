// Room events broadcast by the backend to a live's chat. Over IVS Chat they
// arrive as custom events whose attribute values are ALL strings; over Agora
// RTM they arrive as JSON messages from the `live-server` member with native
// JSON types. Both go through the same parser.

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

export type LiveReconnectingEvent = {
  liveId: string
  reason: string
}

export type LiveEndedEvent = {
  liveId: string
}

export type RoomEvent =
  | { type: 'product-pinned'; event: ProductPinnedEvent }
  | { type: 'stock-update'; event: StockUpdateEvent }
  | { type: 'product-expired'; event: ProductExpiredEvent }
  | { type: 'viewer-count'; count: number }
  | { type: 'live-reconnecting'; event: LiveReconnectingEvent }
  | { type: 'live-ended'; event: LiveEndedEvent }
  /** The seller lifted a chat ban. Transport-internal: never shown in the chat. */
  | { type: 'chat-user-unbanned'; userId: string }

type Attributes = Readonly<Record<string, unknown>>

const DECIMAL = /^-?\d+(\.\d+)?$/

function num(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return DECIMAL.test(trimmed) ? Number(trimmed) : null
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** Parses a room event by name; returns null for unknown names or malformed attributes. */
export function parseRoomEvent(eventName: string, attributes: Attributes | undefined): RoomEvent | null {
  const a = attributes ?? {}
  switch (eventName) {
    case 'product-pinned': {
      const liveProductId = str(a.liveProductId)
      const productName = typeof a.productName === 'string' ? a.productName : null
      const price = num(a.price)
      const displayDurationSeconds = num(a.displayDurationSeconds)
      if (!liveProductId || productName === null || price === null || displayDurationSeconds === null) return null
      return { type: 'product-pinned', event: { liveProductId, productName, price, displayDurationSeconds } }
    }
    case 'stock-update': {
      const liveProductId = str(a.liveProductId)
      const stockRemaining = num(a.stockRemaining)
      if (!liveProductId || stockRemaining === null) return null
      return { type: 'stock-update', event: { liveProductId, stockRemaining } }
    }
    case 'product-expired': {
      const liveProductId = str(a.liveProductId)
      const status = a.status
      if (!liveProductId || (status !== 'AVAILABLE' && status !== 'SOLD')) return null
      return { type: 'product-expired', event: { liveProductId, status } }
    }
    case 'viewer-count': {
      const count = num(a.count)
      return count === null ? null : { type: 'viewer-count', count }
    }
    case 'live-reconnecting': {
      const liveId = str(a.liveId)
      if (!liveId) return null
      return { type: 'live-reconnecting', event: { liveId, reason: typeof a.reason === 'string' ? a.reason : '' } }
    }
    case 'live-ended': {
      const liveId = str(a.liveId)
      return liveId ? { type: 'live-ended', event: { liveId } } : null
    }
    case 'chat-user-unbanned': {
      const userId = str(a.userId)
      return userId ? { type: 'chat-user-unbanned', userId } : null
    }
    default:
      return null
  }
}

/** True when `event` lifts the current user's chat ban (other users ignore it). */
export function isSelfUnbanEvent(event: RoomEvent | null, selfUserId: string): boolean {
  return event?.type === 'chat-user-unbanned' && selfUserId !== '' && event.userId === selfUserId
}

export const AGORA_SYSTEM_MEMBER = 'live-server'

/**
 * Agora RTM system messages: `handled` means the text must NOT be shown as a
 * chat message (it came from `live-server` with a `type`), even when the type
 * is unknown and `event` is null.
 */
export function parseAgoraSystemMessage(
  text: string,
  memberId: string,
): { handled: false } | { handled: true; event: RoomEvent | null } {
  if (memberId !== AGORA_SYSTEM_MEMBER) return { handled: false }

  let payload: unknown
  try {
    payload = JSON.parse(text)
  } catch {
    return { handled: false }
  }
  if (!payload || typeof payload !== 'object') return { handled: false }

  const record = payload as Attributes
  if (typeof record.type !== 'string' || !record.type) return { handled: false }

  return { handled: true, event: parseRoomEvent(record.type, record) }
}
