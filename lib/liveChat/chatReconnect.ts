// Reconnect policy for the IVS chat room. The SDK only retries a failed
// connection a few times back-to-back (no delay); once the room reports
// `disconnect` we schedule our own reconnects with backoff.

export const MAX_CHAT_RECONNECTS = 6
const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 30000

/** Delay before reconnect attempt `attempt` (0-based), or null to give up. */
export function reconnectDelayMs(attempt: number): number | null {
  if (attempt >= MAX_CHAT_RECONNECTS) return null
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt)
}

/** Delay the token provider waits before rejecting a retryable failure, so the
 * SDK's immediate internal retries don't hammer the backend. */
export const TOKEN_RETRY_DELAY_MS = 1500

/** Normalizes a token expiration value (ISO string or epoch s/ms) to a Date. */
export function toChatTokenDate(value: unknown): Date | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value)
  }
  if (typeof value === 'string' && value) {
    const ms = Date.parse(value)
    return Number.isNaN(ms) ? undefined : new Date(ms)
  }
  return undefined
}
