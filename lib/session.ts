import { cookies } from 'next/headers'

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
