import { NextRequest, NextResponse } from 'next/server'
import { refreshWithSingleFlight } from '@/lib/auth/refreshCore'
import { decideAfterRefresh, parseHop, REFRESH_HOP_COOKIE } from '@/lib/auth/sessionDecision'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store', '/live', '/perfil', '/seller/payout']
const BUYER_PREFIXES = ['/buyer']

const ROLE_PREFIXES: { prefixes: string[]; role: string }[] = [
  { prefixes: SELLER_PREFIXES, role: 'SELLER' },
  { prefixes: BUYER_PREFIXES, role: 'BUYER' },
]

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

// Gives a concurrent winner's Set-Cookie time to land before the browser retries.
const RETRY_REDIRECT_DELAY_MS = 300

function getJwtRole(token: string): string | null {
  const payload = parseJwtPayload(token)
  return typeof payload?.role === 'string' ? payload.role : null
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token)
  if (typeof payload?.exp !== 'number') return true
  return Date.now() >= payload.exp * 1000
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

  const matchedRole = ROLE_PREFIXES.find(({ prefixes }) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/')),
  )

  if (matchedRole) {
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

      const result = await refreshWithSingleFlight(refreshToken)
      const decision = decideAfterRefresh(result, {
        method: req.method,
        isServerAction: req.headers.has('next-action'),
        hop: parseHop(req.cookies.get(REFRESH_HOP_COOKIE)?.value),
      })

      if (decision.type === 'logout') {
        const res = NextResponse.redirect(new URL('/login', req.url))
        res.cookies.delete('session')
        res.cookies.delete('refresh_token')
        res.cookies.delete(REFRESH_HOP_COOKIE)
        return res
      }

      if (decision.type === 'retry-redirect') {
        await new Promise((resolve) => setTimeout(resolve, RETRY_REDIRECT_DELAY_MS))
        const res = NextResponse.redirect(req.nextUrl, 307)
        res.cookies.set(REFRESH_HOP_COOKIE, String(decision.hop), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 10,
        })
        return res
      }

      if (decision.type === 'refreshed') {
        const isProduction = process.env.NODE_ENV === 'production'

        // Update the Cookie header so Server Components see the new token via cookies()
        const updatedCookieParts = (req.headers.get('cookie') ?? '')
          .split(';')
          .map((c) => c.trim())
          .filter((c) => !c.startsWith('session=') && !c.startsWith('refresh_token='))
          .concat([`session=${decision.accessToken}`])
        if (decision.refreshToken) {
          updatedCookieParts.push(`refresh_token=${decision.refreshToken}`)
        }
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('cookie', updatedCookieParts.join('; '))

        const response = NextResponse.next({ request: { headers: requestHeaders } })

        // Also set on the response so the browser persists the new cookies
        response.cookies.set('session', decision.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
        if (decision.refreshToken) {
          response.cookies.set('refresh_token', decision.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          })
        }
        if (req.cookies.has(REFRESH_HOP_COOKIE)) response.cookies.delete(REFRESH_HOP_COOKIE)
        return response
      }
      // 'continue': retryable refresh on a non-navigation request (e.g. a Server
      // Function POST) — let it through; the action surfaces a retry signal.
    }

    const role = getJwtRole(sessionToken!)
    if (role !== matchedRole.role) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  const response = NextResponse.next()
  // A retry redirect that landed with a usable session: reset the hop budget.
  if (req.cookies.has(REFRESH_HOP_COOKIE)) response.cookies.delete(REFRESH_HOP_COOKIE)
  return response
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
    '/live',
    '/live/:path+',
    '/perfil',
    '/perfil/:path+',
    '/seller/payout/:path+',
    '/buyer',
    '/buyer/:path+',
  ],
}
