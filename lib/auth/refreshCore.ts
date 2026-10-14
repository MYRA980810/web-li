// Refresh-token rotation shared by middleware (edge) and server code (node).
// Must stay free of `next/headers` so both runtimes can import it.

export type RefreshResult =
  | { kind: 'ok'; accessToken: string; refreshToken?: string }
  /** Transient (409 refresh-retry, 429, 5xx, network). Nothing was issued; never log out. */
  | { kind: 'retry' }
  /** The refresh token is dead (401/400/403). The session is over. */
  | { kind: 'invalid' }

// Extracts the raw refresh_token value from the backend Set-Cookie header(s).
export function extractRefreshTokenFromSetCookie(headers: Headers): string | null {
  try {
    // Prefer getSetCookie() — handles multiple Set-Cookie headers correctly
    const h = headers as Headers & { getSetCookie?: () => string[] }
    if (typeof h.getSetCookie === 'function') {
      for (const cookie of h.getSetCookie()) {
        const match = cookie.match(/^refresh_token=([^;]+)/)
        if (match?.[1]) return match[1]
      }
    }
    // Fallback: get('set-cookie') returns a single string (possibly comma-joined)
    const raw = headers.get('set-cookie')
    if (raw) {
      const match = raw.match(/(?:^|,\s*)refresh_token=([^;,\s]+)/)
      if (match?.[1]) return match[1]
    }
    return null
  } catch {
    return null
  }
}

/** Upper bound for the refresh call, body read included. A hung backend must not pin the single-flight entry. */
export const REFRESH_TIMEOUT_MS = 5_000

function isAbortError(err: unknown): boolean {
  return err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')
}

function isRetryableStatus(status: number): boolean {
  return status === 409 || status === 408 || status === 429 || status >= 500
}

export async function classifyRefreshResponse(res: Response): Promise<RefreshResult> {
  if (res.ok) {
    let accessToken: unknown
    try {
      accessToken = ((await res.json()) as { accessToken?: unknown }).accessToken
    } catch (err) {
      // A timed-out body read is transient; only a malformed body is invalid.
      if (isAbortError(err)) throw err
    }
    // The backend already consumed the old refresh token, so a 200 we cannot
    // use is not retryable — retrying would replay a consumed token.
    if (typeof accessToken !== 'string' || accessToken === '') return { kind: 'invalid' }
    const refreshToken = extractRefreshTokenFromSetCookie(res.headers)
    return refreshToken ? { kind: 'ok', accessToken, refreshToken } : { kind: 'ok', accessToken }
  }
  return isRetryableStatus(res.status) ? { kind: 'retry' } : { kind: 'invalid' }
}

async function requestRefresh(refreshToken: string): Promise<RefreshResult> {
  const api = process.env.API_URL ?? 'http://localhost:8080'
  // AbortController + setTimeout (not AbortSignal.timeout) so tests can drive it with fake timers.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)
  try {
    const res = await fetch(`${api}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: controller.signal,
    })
    return await classifyRefreshResponse(res)
  } catch {
    // Network error, timeout or aborted body read: nothing usable was received.
    return { kind: 'retry' }
  } finally {
    clearTimeout(timer)
  }
}

// Per-instance single-flight, keyed by a hash so raw refresh tokens are not
// kept as map keys. Entries are removed as soon as the refresh settles.
const inFlight = new Map<string, Promise<RefreshResult>>()

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function refreshWithSingleFlight(refreshToken: string): Promise<RefreshResult> {
  const key = await sha256Hex(refreshToken)
  const existing = inFlight.get(key)
  if (existing) return existing

  const flight = requestRefresh(refreshToken).finally(() => {
    inFlight.delete(key)
  })
  inFlight.set(key, flight)
  return flight
}

/** Number of refreshes currently in flight on this instance (for tests/diagnostics). */
export function pendingRefreshCount(): number {
  return inFlight.size
}
