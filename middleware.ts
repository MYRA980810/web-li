import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/login', '/register', '/google-auth', '/select-role']

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const hasSession = req.cookies.has('session')

  if (pathname === '/verify-otp' && !searchParams.get('token')) {
    return NextResponse.redirect(new URL('/register', req.url))
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/verify-otp', '/google-auth', '/select-role'],
}
