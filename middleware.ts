import { NextRequest, NextResponse } from 'next/server'
import { refreshWithSingleFlight } from '@/lib/auth/refreshCore'
import {
  buildReturnPath,
  decideAfterRefresh,
  isDocumentRequest,
  parseHop,
  parseJwtPayload,
  PATHNAME_HEADER,
  REFRESH_HOP_COOKIE,
  refreshStage,
  sessionRetryLoginPath,
} from '@/lib/auth/sessionDecision'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store', '/live', '/perfil', '/seller/payout']
const BUYER_PREFIXES = ['/buyer']
// Same-origin JSON endpoints called with fetch(): they get the same refresh as
// pages, but auth failures answer JSON instead of a redirect.
const BUYER_API_PATHS = ['/api/lives/feed/ticket']

const ROLE_PREFIXES: { prefixes: string[]; role: string }[] = [
  { prefixes: SELLER_PREFIXES, role: 'SELLER' },
  { prefixes: [...BUYER_PREFIXES, ...BUYER_API_PATHS], role: 'BUYER' },
]

// Gives a concurrent winner's Set-Cookie time to land before the browser retries.
const RETRY_REDIRECT_DELAY_MS = 300

function apiAuthError(status: 401 | 403): NextResponse {
  const reason = status === 401 ? 'unauthenticated' : 'forbidden'
  return NextResponse.json({ ok: false, reason }, { status, headers: { 'Cache-Control': 'no-store' } })
}

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
      // Keep refresh_token: only an `invalid` refresh result may delete it, so
      // the next protected navigation can still recover the session.
      const response = NextResponse.next()
      response.cookies.delete('session')
      return response
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  const matchedRole = ROLE_PREFIXES.find(({ prefixes }) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/')),
  )

  if (matchedRole) {
    const isApi = pathname.startsWith('/api/')
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!hasSession && !refreshToken) {
      return isApi ? apiAuthError(401) : NextResponse.redirect(new URL('/login', req.url))
    }

    // A missing session with a refresh token present is refreshed like an expired one.
    const stage = sessionToken ? refreshStage(sessionToken, Date.now()) : 'expired'
    if (stage === 'expired' && !refreshToken) {
      const res = isApi ? apiAuthError(401) : NextResponse.redirect(new URL('/login', req.url))
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
        isDocument: isDocumentRequest(req.headers),
        hop: parseHop(req.cookies.get(REFRESH_HOP_COOKIE)?.value),
      })

      if (decision.type === 'logout') {
        const res = isApi ? apiAuthError(401) : NextResponse.redirect(new URL('/login', req.url))
        res.cookies.delete('session')
        res.cookies.delete('refresh_token')
        res.cookies.delete(REFRESH_HOP_COOKIE)
        return res
      }

      if (decision.type === 'session-retry-login') {
        // Transient failures only: refresh_token stays so a later navigation can recover.
        const res = NextResponse.redirect(new URL(sessionRetryLoginPath(buildReturnPath(req.nextUrl)), req.url))
        res.cookies.delete('session')
        res.cookies.delete(REFRESH_HOP_COOKIE)
        return res
      }

      if (decision.type === 'defer-to-document') {
        // A non-RSC / non-2xx answer makes the client router fall back to a
        // document navigation, which owns the hop budget. Prefetches just fail.
        return new NextResponse(null, { status: 503, headers: { 'Cache-Control': 'no-store' } })
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
          // Keep the current refresh_token when the backend did not rotate it.
          .filter((c) => !c.startsWith('session=') && !(decision.refreshToken && c.startsWith('refresh_token=')))
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

    if (sessionToken && getJwtRole(sessionToken) !== matchedRole.role) {
      return isApi ? apiAuthError(403) : NextResponse.redirect(new URL('/', req.url))
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
    '/api/lives/feed/ticket',
  ],
}
