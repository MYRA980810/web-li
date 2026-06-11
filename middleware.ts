import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

const SELLER_PREFIXES = ['/home', '/store']

function getJwtRole(token: string): string | null {
  try {
    const part = token.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>
    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const sessionToken = req.cookies.get('session')?.value
  const hasSession = !!sessionToken

  if (pathname === '/verify-otp' && !searchParams.get('token')) {
    return NextResponse.redirect(new URL('/register', req.url))
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
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
