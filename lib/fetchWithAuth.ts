import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearSessionCookies, refreshAccessToken } from './session'

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

  const newToken = await refreshAccessToken()
  if (!newToken) {
    try { await clearSessionCookies() } catch { /* read-only context */ }
    redirect('/login')
  }

  return fetch(url, withBearer(newToken))
}
