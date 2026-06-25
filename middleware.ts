import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store']

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

export function middleware(req: NextRequest) {
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
    const role = getJwtRole(sessionToken)
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
