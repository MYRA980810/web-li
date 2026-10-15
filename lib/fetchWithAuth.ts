import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearSessionCookies, setRefreshTokenCookie, setSessionCookie } from './session'
import { refreshWithSingleFlight } from './auth/refreshCore'
import { SessionRetryError } from './auth/sessionRetry'
import { isRefreshDue, PATHNAME_HEADER, safeReturnPath } from './auth/sessionDecision'

export const API = process.env.API_URL ?? 'http://localhost:8080'

export async function parseProblemDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? 'Ocurrió un error inesperado'
  } catch {
    return 'Ocurrió un error inesperado'
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value ?? null
}

export async function requireToken(): Promise<string> {
  const token = await getToken()
  if (!token) redirect('/login')
  return token
}

export function isNextInternalError(err: unknown): boolean {
  return err != null && typeof err === 'object' && 'digest' in err
}

async function logout(): Promise<never> {
  try { await clearSessionCookies() } catch { /* read-only context */ }
  redirect('/login')
}

type CookieStore = Awaited<ReturnType<typeof cookies>>

const COOKIE_WRITE_PROBE = '__auth_ctx_probe'

// Next 16 has no public API to tell a Server Component render apart from a
// Server Function / Route Handler. Only the latter can write cookies; during a
// render any mutation throws. Deleting a never-set probe cookie detects that —
// in a writable context it only adds an already-expired Set-Cookie for the probe.
function canWriteCookies(cookieStore: CookieStore): boolean {
  try {
    cookieStore.delete(COOKIE_WRITE_PROBE)
    return true
  } catch {
    return false
  }
}

// A render cannot persist a rotated refresh token (the write would be dropped
// while the backend already consumed the old one), so it never refreshes.
// Instead it navigates to the same path and lets the middleware refresh.
async function redirectForMiddlewareRefresh(expiredToken: string): Promise<never> {
  const path = safeReturnPath((await headers()).get(PATHNAME_HEADER))
  // No header: path not covered by the middleware. Not due: the middleware
  // would pass the token through unchanged. Either way a redirect would loop.
  if (path && isRefreshDue(expiredToken, Date.now())) redirect(path)
  return logout()
}

// 401 codes that one refresh can resolve. INVALID_TOKEN covers every
// non-expiry JWT failure on the backend (bad signature, JWT_SECRET rotation,
// deleted user, transient DB error); the opaque refresh token is validated
// against the DB, so a single refresh sorts them out: rotation → new token,
// deleted user → `invalid` (logout), DB down → `retry`. INVALID_TOKEN itself
// never clears cookies — only an `invalid` refresh result does.
type RefreshableCode = 'TOKEN_EXPIRED' | 'INVALID_TOKEN'

function isRefreshableCode(code: string | undefined): code is RefreshableCode {
  return code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN'
}

// Refreshes the session for a refreshable 401. Throws SessionRetryError on a
// transient refresh result — never logs out on 409/429/5xx/network. Returns
// null when the caller should hand back the original 401 untouched.
async function refreshSession(rejectedToken: string, code: RefreshableCode): Promise<string | null> {
  const cookieStore = await cookies()
  if (!canWriteCookies(cookieStore)) {
    // A fresh-looking token the backend rejects is not something the
    // middleware will refresh; a redirect would only log out. Keep today's
    // behavior and let the caller see the 401.
    if (code === 'INVALID_TOKEN' && !isRefreshDue(rejectedToken, Date.now())) return null
    return redirectForMiddlewareRefresh(rejectedToken)
  }

  // Another fetchWithAuth call in this same request already refreshed.
  const current = cookieStore.get('session')?.value
  if (current && current !== rejectedToken) return current

  const refreshToken = cookieStore.get('refresh_token')?.value
  // Nothing to refresh with. INVALID_TOKEN alone never clears cookies.
  if (!refreshToken) return code === 'INVALID_TOKEN' ? null : logout()

  const result = await refreshWithSingleFlight(refreshToken)
  if (result.kind === 'retry') throw new SessionRetryError()
  if (result.kind === 'invalid') return logout()

  await setSessionCookie(result.accessToken)
  if (result.refreshToken) await setRefreshTokenCookie(result.refreshToken)

  return result.accessToken
}

export async function fetchWithAuth(url: string, init: RequestInit, token: string): Promise<Response> {
  const withBearer = (t: string): RequestInit => ({
    ...init,
    headers: { ...(init.headers as Record<string, string> ?? {}), Authorization: `Bearer ${t}` },
  })

  const res = await fetch(url, withBearer(token))
  if (res.status !== 401) return res

  const clone = res.clone()
  let code: string | undefined
  try { code = ((await clone.json()) as { code?: string }).code } catch { /* empty */ }
  if (!isRefreshableCode(code)) return res

  const newToken = await refreshSession(token, code)
  if (newToken === null) return res
  // Exactly one retry: a second 401 is returned as-is, never refreshed again.
  return fetch(url, withBearer(newToken))
}
