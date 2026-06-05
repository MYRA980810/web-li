import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

const API = process.env.API_URL ?? 'http://localhost:8080'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) redirect('/login')

  let accessToken: string
  try {
    const res = await fetch(`${API}/api/auth/oauth2/exchange`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code }),
    })
    if (!res.ok) redirect('/login?error=oauth_failed')
    const data = await res.json()
    accessToken = data.accessToken
  } catch {
    redirect('/login?error=oauth_failed')
  }

  const cookieStore = await cookies()
  cookieStore.set('session', accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  })
  redirect('/')
}
