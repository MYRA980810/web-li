import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearSessionCookies, setRefreshTokenCookie, setSessionCookie } from './session'
import { refreshWithSingleFlight } from './auth/refreshCore'
import { SessionRetryError } from './auth/sessionRetry'

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

// Refreshes the session for a TOKEN_EXPIRED response. Throws SessionRetryError
// on a transient refresh result — never logs out on 409/429/5xx/network.
async function refreshSession(expiredToken: string): Promise<string> {
  const cookieStore = await cookies()

  // Another fetchWithAuth call in this same request already refreshed.
  const current = cookieStore.get('session')?.value
  if (current && current !== expiredToken) return current

  const refreshToken = cookieStore.get('refresh_token')?.value
  if (!refreshToken) return logout()

  const result = await refreshWithSingleFlight(refreshToken)
  if (result.kind === 'retry') throw new SessionRetryError()
  if (result.kind === 'invalid') return logout()

  try {
    await setSessionCookie(result.accessToken)
    if (result.refreshToken) await setRefreshTokenCookie(result.refreshToken)
  } catch { /* Server Component context — cookies are read-only */ }

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
  if (code !== 'TOKEN_EXPIRED') return res

  const newToken = await refreshSession(token)
  return fetch(url, withBearer(newToken))
}
