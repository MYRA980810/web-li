import { cookies } from 'next/headers'

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
