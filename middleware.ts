import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store']

const API = process.env.API_URL ?? 'http://localhost:8080'

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

function getJwtRole(token: string): string | null {
  const payload = parseJwtPayload(token)
  return typeof payload?.role === 'string' ? payload.role : null
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token)
  if (typeof payload?.exp !== 'number') return true
  return Date.now() >= payload.exp * 1000
}

function extractRefreshTokenFromSetCookie(headers: Headers): string | null {
  try {
    const h = headers as Headers & { getSetCookie?: () => string[] }
    if (typeof h.getSetCookie === 'function') {
      for (const cookie of h.getSetCookie()) {
        const match = cookie.match(/^refresh_token=([^;]+)/)
        if (match?.[1]) return match[1]
      }
    }
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

async function tryRefreshSession(
  req: NextRequest,
  refreshToken: string,
): Promise<{ accessToken: string; newRefreshToken: string | null } | null> {
  try {
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { accessToken: string }
    const newRefreshToken = extractRefreshTokenFromSetCookie(res.headers)
    return { accessToken: data.accessToken, newRefreshToken }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const sessionToken = req.cookies.get('session')?.value
  const hasSession = !!sessionToken

  if (pathname === '/verify-otp' && !searchParams.get('token')) {
    return NextResponse.redirect(new URL('/register', req.url))
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    if (isTokenExpired(sessionToken!)) {
      const response = NextResponse.next()
      response.cookies.delete('session')
      response.cookies.delete('refresh_token')
      return response
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  const isSellerRoute = SELLER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  )

  if (isSellerRoute) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isTokenExpired(sessionToken!)) {
      const refreshToken = req.cookies.get('refresh_token')?.value
      if (!refreshToken) {
        const res = NextResponse.redirect(new URL('/login', req.url))
        res.cookies.delete('session')
        return res
      }

      const refreshed = await tryRefreshSession(req, refreshToken)
      if (!refreshed) {
        const res = NextResponse.redirect(new URL('/login', req.url))
        res.cookies.delete('session')
        res.cookies.delete('refresh_token')
        return res
      }

      const isProduction = process.env.NODE_ENV === 'production'

      // Update the Cookie header so Server Components see the new token via cookies()
      const updatedCookieParts = (req.headers.get('cookie') ?? '')
        .split(';')
        .map((c) => c.trim())
        .filter((c) => !c.startsWith('session=') && !c.startsWith('refresh_token='))
        .concat([`session=${refreshed.accessToken}`])
      if (refreshed.newRefreshToken) {
        updatedCookieParts.push(`refresh_token=${refreshed.newRefreshToken}`)
      }
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('cookie', updatedCookieParts.join('; '))

      const response = NextResponse.next({ request: { headers: requestHeaders } })

      // Also set on the response so the browser persists the new cookies
      response.cookies.set('session', refreshed.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      if (refreshed.newRefreshToken) {
        response.cookies.set('refresh_token', refreshed.newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        })
      }
      return response
    }

    const role = getJwtRole(sessionToken!)
    if (role !== 'SELLER') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/verify-otp',
    '/google-auth',
    '/select-role',
    '/home',
    '/store',
    '/store/:path+',
  ],
}
