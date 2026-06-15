import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:8080'

export type SessionPayload = {
  sub: string
  role: 'SELLER' | 'BUYER'
  contact: string
  iat: number
  exp: number
}

export async function setSessionCookie(accessToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  })
}

export async function setRefreshTokenCookie(rawToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('refresh_token', rawToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
  })
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('refresh_token')?.value ?? null
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('refresh_token')
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const payloadB64 = token.split('.')[1]
    const decoded = Buffer.from(payloadB64, 'base64url').toString('utf-8')
    return JSON.parse(decoded) as SessionPayload
  } catch {
    return null
  }
}

// Extracts the raw refresh_token value from a Spring Boot Set-Cookie header.
export function extractRefreshTokenFromSetCookie(res: Response): string | null {
  try {
    const setCookies = res.headers.getSetCookie()
    const match = setCookies
      .map((h) => h.match(/^refresh_token=([^;]+)/))
      .find(Boolean)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

// Silently refreshes the access token using the stored refresh_token.
// Returns the new access token on success, null on failure (caller should redirect to login).
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    if (!res.ok) {
      await clearSessionCookies()
      return null
    }

    const data = (await res.json()) as { accessToken: string }
    await setSessionCookie(data.accessToken)

    const newRaw = extractRefreshTokenFromSetCookie(res)
    if (newRaw) await setRefreshTokenCookie(newRaw)

    return data.accessToken
  } catch {
    return null
  }
}
