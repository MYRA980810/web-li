import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const refreshMock = vi.fn()
vi.mock('@/lib/auth/refreshCore', () => ({
  refreshWithSingleFlight: (rt: string) => refreshMock(rt),
}))

const { middleware } = await import('./middleware')

function jwt(expInSeconds: number, role = 'BUYER'): string {
  const exp = Math.floor(Date.now() / 1000) + expInSeconds
  return `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: 'u1', role, exp })).toString('base64url')}.sig`
}

function request(path: string, cookies: Record<string, string>, headers: Record<string, string> = {}): NextRequest {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  return new NextRequest(new URL(path, 'https://app.test'), {
    headers: { 'sec-fetch-dest': 'document', ...(cookie ? { cookie } : {}), ...headers },
  })
}

/** name → value for every Set-Cookie on the response ('' means deleted). */
function setCookies(res: Response): Record<string, string> {
  const out: Record<string, string> = {}
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(';')
    const i = pair.indexOf('=')
    out[pair.slice(0, i)] = pair.slice(i + 1)
  }
  return out
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

async function run(req: NextRequest): Promise<Response> {
  const pending = middleware(req)
  await vi.runAllTimersAsync()
  return pending
}

describe('middleware: retryable refresh never deletes the refresh token', () => {
  it('hop budget exhausted → /login with next + reason, deletes only session and rr_hop', async () => {
    refreshMock.mockResolvedValue({ kind: 'retry' })
    const res = await run(request('/buyer/lives?cat=a', { session: jwt(-10), refresh_token: 'rt-1', rr_hop: '2' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://app.test/login?reason=session-retry&next=%2Fbuyer%2Flives%3Fcat%3Da',
    )
    const cookies = setCookies(res)
    expect(cookies.session).toBe('')
    expect(cookies.rr_hop).toBe('')
    expect(cookies).not.toHaveProperty('refresh_token')
  })

  it('first retryable hop redirects to the same URL and keeps both cookies', async () => {
    refreshMock.mockResolvedValue({ kind: 'retry' })
    const res = await run(request('/buyer/lives', { session: jwt(-10), refresh_token: 'rt-1' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://app.test/buyer/lives')
    expect(setCookies(res)).toEqual({ rr_hop: '1' })
  })

  it('RSC/prefetch fetch on a retryable result → 503 (router hard-navigates), no hop consumed', async () => {
    refreshMock.mockResolvedValue({ kind: 'retry' })
    const variants: Record<string, string>[] = [
      { rsc: '1', 'sec-fetch-dest': 'empty' },
      { rsc: '1', 'next-router-prefetch': '1', 'sec-fetch-dest': 'empty' },
    ]
    for (const headers of variants) {
      const res = await run(request('/buyer/lives', { session: jwt(-10), refresh_token: 'rt-1', rr_hop: '1' }, headers))
      expect(res.status).toBe(503)
      expect(res.headers.get('cache-control')).toBe('no-store')
      expect(setCookies(res)).toEqual({})
    }
  })

  it('invalid refresh → /login and deletes both cookies', async () => {
    refreshMock.mockResolvedValue({ kind: 'invalid' })
    const res = await run(request('/buyer/lives', { session: jwt(-10), refresh_token: 'rt-1' }))

    expect(res.headers.get('location')).toBe('https://app.test/login')
    const cookies = setCookies(res)
    expect(cookies.session).toBe('')
    expect(cookies.refresh_token).toBe('')
  })
})

describe('middleware: missing session but refresh token present on a protected path', () => {
  it('refreshes instead of redirecting to /login', async () => {
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: jwt(900), refreshToken: 'rt-2' })
    const res = await run(request('/buyer/lives', { refresh_token: 'rt-1' }))

    expect(refreshMock).toHaveBeenCalledWith('rt-1')
    expect(res.headers.get('location')).toBeNull()
    const cookies = setCookies(res)
    expect(cookies.refresh_token).toBe('rt-2')
    expect(cookies.session).not.toBe('')
  })

  it('retryable → same-URL retry redirect, refresh token kept', async () => {
    refreshMock.mockResolvedValue({ kind: 'retry' })
    const res = await run(request('/buyer/lives', { refresh_token: 'rt-1' }))
    expect(res.headers.get('location')).toBe('https://app.test/buyer/lives')
    expect(setCookies(res)).not.toHaveProperty('refresh_token')
  })

  it('invalid → /login, both cookies cleared', async () => {
    refreshMock.mockResolvedValue({ kind: 'invalid' })
    const res = await run(request('/buyer/lives', { refresh_token: 'rt-1' }))
    expect(res.headers.get('location')).toBe('https://app.test/login')
    expect(setCookies(res).refresh_token).toBe('')
  })

  it('no refresh token either → /login without refreshing', async () => {
    const res = await run(request('/buyer/lives', {}))
    expect(refreshMock).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBe('https://app.test/login')
  })
})

describe('middleware: auth routes', () => {
  it('/login with an expired session + refresh token deletes only the session', async () => {
    const res = await run(request('/login?reason=session-retry', { session: jwt(-10), refresh_token: 'rt-1' }))

    expect(refreshMock).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBeNull()
    const cookies = setCookies(res)
    expect(cookies.session).toBe('')
    expect(cookies).not.toHaveProperty('refresh_token')
  })

  it('/login with only a refresh token renders login and keeps it', async () => {
    const res = await run(request('/login', { refresh_token: 'rt-1' }))
    expect(res.headers.get('location')).toBeNull()
    expect(setCookies(res)).toEqual({})
  })

  it('/login with a valid session redirects home', async () => {
    const res = await run(request('/login', { session: jwt(900), refresh_token: 'rt-1' }))
    expect(res.headers.get('location')).toBe('https://app.test/')
  })
})

describe('middleware: forwarded cookie header', () => {
  it('keeps the existing refresh_token when the backend did not rotate it', async () => {
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-new' })
    const res = await run(request('/buyer/lives', { session: jwt(-10), refresh_token: 'rt-1' }))

    const forwarded = res.headers.get('x-middleware-request-cookie') ?? ''
    expect(forwarded).toContain('session=at-new')
    expect(forwarded).toContain('refresh_token=rt-1')
  })
})

describe('middleware: stream ticket route handler (/api/lives/feed/ticket)', () => {
  const TICKET = '/api/lives/feed/ticket'

  function ticketRequest(cookies: Record<string, string>): NextRequest {
    const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
    return new NextRequest(new URL(TICKET, 'https://app.test'), {
      method: 'POST',
      headers: { 'sec-fetch-dest': 'empty', ...(cookie ? { cookie } : {}) },
    })
  }

  it('is covered by the matcher', async () => {
    const { config } = await import('./middleware')
    expect(config.matcher).toContain(TICKET)
  })

  it('fresh BUYER session → passes through untouched', async () => {
    const res = await run(ticketRequest({ session: jwt(900), refresh_token: 'rt-1' }))
    expect(refreshMock).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBeNull()
    expect(res.status).toBe(200)
    expect(setCookies(res)).toEqual({})
  })

  it('inside the proactive window → refreshes before the handler runs and persists the cookies', async () => {
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-new', refreshToken: 'rt-2' })
    const res = await run(ticketRequest({ session: jwt(30), refresh_token: 'rt-1' }))

    expect(refreshMock).toHaveBeenCalledWith('rt-1')
    expect(res.headers.get('location')).toBeNull()
    expect(setCookies(res)).toMatchObject({ session: 'at-new', refresh_token: 'rt-2' })
    expect(res.headers.get('x-middleware-request-cookie') ?? '').toContain('session=at-new')
  })

  it('expired + retryable refresh → passes through (handler answers retry), refresh token kept', async () => {
    refreshMock.mockResolvedValue({ kind: 'retry' })
    const res = await run(ticketRequest({ session: jwt(-10), refresh_token: 'rt-1' }))
    expect(res.headers.get('location')).toBeNull()
    expect(res.status).toBe(200)
    expect(setCookies(res)).not.toHaveProperty('refresh_token')
  })

  it('invalid refresh → 401 JSON (no redirect), both cookies cleared', async () => {
    refreshMock.mockResolvedValue({ kind: 'invalid' })
    const res = await run(ticketRequest({ session: jwt(-10), refresh_token: 'rt-1' }))
    expect(res.status).toBe(401)
    expect(res.headers.get('location')).toBeNull()
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(setCookies(res)).toMatchObject({ session: '', refresh_token: '' })
  })

  it('no session and no refresh token → 401 JSON without refreshing', async () => {
    const res = await run(ticketRequest({}))
    expect(refreshMock).not.toHaveBeenCalled()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
  })

  it('expired session without a refresh token → 401 JSON, session cleared', async () => {
    const res = await run(ticketRequest({ session: jwt(-10) }))
    expect(res.status).toBe(401)
    expect(setCookies(res).session).toBe('')
  })

  it('a SELLER session → 403 JSON forbidden', async () => {
    const res = await run(ticketRequest({ session: jwt(900, 'SELLER'), refresh_token: 'rt-1' }))
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ ok: false, reason: 'forbidden' })
  })
})
