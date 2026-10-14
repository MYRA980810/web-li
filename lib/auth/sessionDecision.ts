// Pure middleware decisions for the session refresh flow (no Next imports, unit-testable).
import type { RefreshResult } from './refreshCore'

/** Short-lived counter cookie that bounds retry redirects on GET navigations. */
export const REFRESH_HOP_COOKIE = 'rr_hop'
export const MAX_REFRESH_HOPS = 2

export type RefreshRequestInfo = {
  method: string
  /** True when the request carries the `next-action` header (Server Function POST). */
  isServerAction: boolean
  /** Retry redirects already taken for this navigation (from REFRESH_HOP_COOKIE). */
  hop: number
}

export type SessionDecision =
  | { type: 'refreshed'; accessToken: string; refreshToken?: string }
  /** Pass the request through with the current cookies. */
  | { type: 'continue' }
  /** Redirect to the same URL so the browser re-sends it with whatever cookies landed meanwhile. */
  | { type: 'retry-redirect'; hop: number }
  | { type: 'logout' }

export function parseHop(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function isNavigation(req: RefreshRequestInfo): boolean {
  return !req.isServerAction && (req.method === 'GET' || req.method === 'HEAD')
}

/** Decision for a request whose session token is expired, given the refresh outcome. */
export function decideAfterRefresh(result: RefreshResult, req: RefreshRequestInfo): SessionDecision {
  if (result.kind === 'ok') {
    return result.refreshToken
      ? { type: 'refreshed', accessToken: result.accessToken, refreshToken: result.refreshToken }
      : { type: 'refreshed', accessToken: result.accessToken }
  }
  if (result.kind === 'invalid') return { type: 'logout' }

  // Retryable: another caller most likely rotated the refresh token already.
  if (!isNavigation(req)) return { type: 'continue' }
  if (req.hop >= MAX_REFRESH_HOPS) return { type: 'logout' }
  return { type: 'retry-redirect', hop: req.hop + 1 }
}
