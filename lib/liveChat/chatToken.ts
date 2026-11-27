import type { IvsChatTokenData } from '@/lib/liveActions'

function strOrNull(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

/** Expirations are ISO strings; epoch numbers are kept too (see toChatTokenDate). */
function expiration(value: unknown): string | number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : strOrNull(value)
}

/**
 * Parses the GET /api/lives/{id}/chat/token body. `canSend` is false for a
 * buyer banned by the seller (receive-only token); a missing or non-boolean
 * value means true, for backends that predate the field. Returns null when
 * the body lacks a token or region.
 */
export function parseIvsChatTokenBody(body: unknown, userId: string): IvsChatTokenData | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const token = strOrNull(b.token)
  const region = strOrNull(b.region)
  if (!token || !region) return null
  return {
    token,
    sessionExpirationTime: expiration(b.sessionExpirationTime),
    tokenExpirationTime: expiration(b.tokenExpirationTime),
    region,
    canSend: b.canSend !== false,
    userId,
  }
}
