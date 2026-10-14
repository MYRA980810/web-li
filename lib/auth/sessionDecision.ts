// Pure middleware decisions for the session refresh flow (no Next imports, unit-testable).
import type { RefreshResult } from './refreshCore'

/**
 * Internal request header the middleware sets (pathname + search) on the paths
 * it processes, so a Server Component render can redirect back to itself.
 */
export const PATHNAME_HEADER = 'x-pathname'

/** Short-lived counter cookie that bounds retry redirects on GET navigations. */
export const REFRESH_HOP_COOKIE = 'rr_hop'
export const MAX_REFRESH_HOPS = 2

/** Refresh this long before `exp` so requests rarely reach the backend with an expiring token. */
export const REFRESH_SKEW_MS = 60_000

export type RefreshStage = 'fresh' | 'proactive' | 'expired'

export type RefreshRequestInfo = {
  /** False inside the proactive window: the current token is still usable. */
  expired: boolean
  method: string
  /** True when the request carries the `next-action` header (Server Function POST). */
  isServerAction: boolean
  /** A browser document navigation, as opposed to an RSC/prefetch fetch (see isDocumentRequest). */
  isDocument: boolean
  /** Retry redirects already taken for this navigation (from REFRESH_HOP_COOKIE). */
  hop: number
}

export type SessionDecision =
  | { type: 'refreshed'; accessToken: string; refreshToken?: string }
  /** Pass the request through with the current cookies. */
  | { type: 'continue' }
  /** Redirect to the same URL so the browser re-sends it with whatever cookies landed meanwhile. */
  | { type: 'retry-redirect'; hop: number }
  /** RSC/prefetch fetch: fail it so the client router falls back to a document navigation (which owns the hop budget). */
  | { type: 'defer-to-document' }
  /** Hop budget spent on transient errors: go to /login but KEEP the refresh token so a later navigation can recover. */
  | { type: 'session-retry-login' }
  /** The refresh token is dead: clear both cookies. The only outcome allowed to delete refresh_token. */
  | { type: 'logout' }

export function parseHop(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function isNavigation(req: RefreshRequestInfo): boolean {
  return !req.isServerAction && (req.method === 'GET' || req.method === 'HEAD')
}

/**
 * Next 16 client-router fetches send `rsc` (plus `next-router-prefetch` /
 * `next-router-segment-prefetch` for prefetches) and `Sec-Fetch-Dest: empty`;
 * browser document navigations send `Sec-Fetch-Dest: document`.
 */
export function isDocumentRequest(headers: Headers): boolean {
  if (headers.has('rsc') || headers.has('next-router-prefetch') || headers.has('next-router-segment-prefetch')) {
    return false
  }
  const dest = headers.get('sec-fetch-dest')
  return dest === null || dest === 'document'
}

/** /login target used when transient refresh failures are exhausted. Never carries an unsafe `next`. */
export function sessionRetryLoginPath(next: string | null): string {
  const params = new URLSearchParams({ reason: 'session-retry' })
  const safeNext = safeReturnPath(next)
  if (safeNext) params.set('next', safeNext)
  return `/login?${params}`
}

/** Decision for a request whose session token is due for refresh, given the refresh outcome. */
export function decideAfterRefresh(result: RefreshResult, req: RefreshRequestInfo): SessionDecision {
  if (result.kind === 'ok') {
    return result.refreshToken
      ? { type: 'refreshed', accessToken: result.accessToken, refreshToken: result.refreshToken }
      : { type: 'refreshed', accessToken: result.accessToken }
  }
  if (result.kind === 'invalid') return { type: 'logout' }

  // Retryable: another caller most likely rotated the refresh token already.
  if (!req.expired || !isNavigation(req)) return { type: 'continue' }
  if (!req.isDocument) return { type: 'defer-to-document' }
  if (req.hop >= MAX_REFRESH_HOPS) return { type: 'session-retry-login' }
  return { type: 'retry-redirect', hop: req.hop + 1 }
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Session token lifecycle stage, decoded locally (no signature check). */
export function refreshStage(token: string, nowMs: number): RefreshStage {
  const exp = parseJwtPayload(token)?.exp
  if (typeof exp !== 'number') return 'expired'
  const expMs = exp * 1000
  if (nowMs >= expMs) return 'expired'
  return nowMs >= expMs - REFRESH_SKEW_MS ? 'proactive' : 'fresh'
}

/** Whether the middleware refreshes this session token. */
export function isRefreshDue(token: string, nowMs: number): boolean {
  return refreshStage(token, nowMs) !== 'fresh'
}

export function buildReturnPath(url: { pathname: string; search: string }): string {
  const params = new URLSearchParams(url.search)
  params.delete('_rsc')
  const search = params.toString()
  return search ? `${url.pathname}?${search}` : url.pathname
}

/** Accepts only same-origin relative paths; anything else yields null. */
export function safeReturnPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
  return raw
}
