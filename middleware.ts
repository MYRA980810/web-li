import { NextRequest, NextResponse } from 'next/server'
import { refreshWithSingleFlight } from '@/lib/auth/refreshCore'
import {
  buildReturnPath,
  decideAfterRefresh,
  parseHop,
  parseJwtPayload,
  PATHNAME_HEADER,
  REFRESH_HOP_COOKIE,
  refreshStage,
} from '@/lib/auth/sessionDecision'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store', '/live', '/perfil', '/seller/payout']
const BUYER_PREFIXES = ['/buyer']

const ROLE_PREFIXES: { prefixes: string[]; role: string }[] = [
  { prefixes: SELLER_PREFIXES, role: 'SELLER' },
  { prefixes: BUYER_PREFIXES, role: 'BUYER' },
]

// Gives a concurrent winner's Set-Cookie time to land before the browser retries.
const RETRY_REDIRECT_DELAY_MS = 300

function getJwtRole(token: string): string | null {
  const payload = parseJwtPayload(token)
  return typeof payload?.role === 'string' ? payload.role : null
}

// Lets a Server Component render redirect back to this URL (see fetchWithAuth).
// Always overwritten, so a client-supplied value never reaches the render.
function withPathnameHeader(req: NextRequest): Headers {
  const headers = new Headers(req.headers)
  headers.set(PATHNAME_HEADER, buildReturnPath(req.nextUrl))
  return headers
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const sessionToken = req.cookies.get('session')?.value
  const hasSession = !!sessionToken

  if (pathname === '/verify-otp' && !searchParams.get('token')) {
    return NextResponse.redirect(new URL('/register', req.url))
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    if (refreshStage(sessionToken!, Date.now()) === 'expired') {
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

    const stage = refreshStage(sessionToken!, Date.now())
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (stage === 'expired' && !refreshToken) {
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.delete('session')
      return res
    }

    // Expired, or inside the proactive window (exp - 60s): refresh here, the
    // only place that can both forward the new tokens and persist them.
    if (stage !== 'fresh' && refreshToken) {

      const result = await refreshWithSingleFlight(refreshToken)
      const decision = decideAfterRefresh(result, {
        expired: stage === 'expired',
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
        const requestHeaders = withPathnameHeader(req)
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
      // 'continue': retryable refresh while the token is still valid, or on a
      // non-navigation request (e.g. a Server Function POST) — let it through;
      // the action surfaces a retry signal if the token is really expired.
    }

    const role = getJwtRole(sessionToken!)
    if (role !== matchedRole.role) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  const response = matchedRole
    ? NextResponse.next({ request: { headers: withPathnameHeader(req) } })
    : NextResponse.next()
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
