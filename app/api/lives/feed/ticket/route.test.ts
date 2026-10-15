import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cookieJar = new Map<string, string>()
const cookieStore = {
  get: vi.fn((name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined)),
  set: vi.fn((name: string, value: string) => {
    cookieJar.set(name, value)
  }),
  delete: vi.fn((name: string) => {
    cookieJar.delete(name)
  }),
}

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
  headers: async () => new Headers(),
}))

class RedirectSignal extends Error {
  readonly digest: string
  constructor(public readonly url: string) {
    super('NEXT_REDIRECT')
    this.digest = `NEXT_REDIRECT;replace;${url};307;`
  }
}
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url)
  },
}))

const refreshMock = vi.fn()
vi.mock('@/lib/auth/refreshCore', () => ({
  refreshWithSingleFlight: (rt: string) => refreshMock(rt),
}))

const { POST } = await import('./route')

let fetchMock: ReturnType<typeof vi.fn>

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

beforeEach(() => {
  cookieJar.clear()
  cookieJar.set('session', 'at-1')
  cookieJar.set('refresh_token', 'rt-1')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('POST /api/lives/feed/ticket', () => {
  it('200 → returns the ticket, never cached', async () => {
    fetchMock.mockResolvedValue(json(200, { ticket: 'T'.repeat(43), expiresInMs: 30000 }))

    const res = await POST()

    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(await res.json()).toEqual({ ok: true, ticket: 'T'.repeat(43) })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/lives\/feed\/stream-ticket$/)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer at-1' })
  })

  it('no session and no refresh token → 401 unauthenticated without calling the backend', async () => {
    cookieJar.clear()
    const res = await POST()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('no session but a refresh token (middleware refresh was transient) → retry', async () => {
    cookieJar.delete('session')
    const res = await POST()
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, reason: 'retry' })
    expect(cookieJar.get('refresh_token')).toBe('rt-1')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('403 (not a BUYER) → terminal forbidden', async () => {
    fetchMock.mockResolvedValue(json(403, { status: 403 }))
    const res = await POST()
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ ok: false, reason: 'forbidden' })
  })

  it('503 TICKET_STORE_UNAVAILABLE → retry with Retry-After, never refreshes the session', async () => {
    fetchMock.mockResolvedValue(
      json(503, { status: 503, code: 'TICKET_STORE_UNAVAILABLE' }, { 'Retry-After': '5' }),
    )
    const res = await POST()
    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('5')
    expect(await res.json()).toEqual({ ok: false, reason: 'retry', retryAfterMs: 5000 })
    expect(refreshMock).not.toHaveBeenCalled()
    expect(cookieJar.get('session')).toBe('at-1')
  })

  it('503 without Retry-After → 5 s fallback', async () => {
    fetchMock.mockResolvedValue(json(503, { status: 503, code: 'TICKET_STORE_UNAVAILABLE' }))
    const res = await POST()
    expect(await res.json()).toEqual({ ok: false, reason: 'retry', retryAfterMs: 5000 })
  })

  it('TOKEN_EXPIRED + ok refresh → persists the new session and returns a ticket', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { code: 'TOKEN_EXPIRED' }))
      .mockResolvedValueOnce(json(200, { ticket: 'fresh', expiresInMs: 30000 }))
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-2', refreshToken: 'rt-2' })

    const res = await POST()

    expect(await res.json()).toEqual({ ok: true, ticket: 'fresh' })
    expect(cookieJar.get('session')).toBe('at-2')
    expect(cookieJar.get('refresh_token')).toBe('rt-2')
  })

  it('TOKEN_EXPIRED + 409 refresh-retry → retry, refresh token kept (not a logout)', async () => {
    fetchMock.mockResolvedValue(json(401, { code: 'TOKEN_EXPIRED' }))
    refreshMock.mockResolvedValue({ kind: 'retry' })

    const res = await POST()

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, reason: 'retry' })
    expect(cookieJar.get('refresh_token')).toBe('rt-1')
  })

  it('TOKEN_EXPIRED + invalid refresh → 401 unauthenticated, session cookies cleared', async () => {
    fetchMock.mockResolvedValue(json(401, { code: 'TOKEN_EXPIRED' }))
    refreshMock.mockResolvedValue({ kind: 'invalid' })

    const res = await POST()

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(cookieJar.has('session')).toBe(false)
    expect(cookieJar.has('refresh_token')).toBe(false)
  })

  it('INVALID_TOKEN + ok refresh → retries once and returns a ticket', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { code: 'INVALID_TOKEN' }))
      .mockResolvedValueOnce(json(200, { ticket: 'rotated', expiresInMs: 30000 }))
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-2', refreshToken: 'rt-2' })

    const res = await POST()

    expect(await res.json()).toEqual({ ok: true, ticket: 'rotated' })
    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(cookieJar.get('session')).toBe('at-2')
  })

  it('INVALID_TOKEN twice → unauthenticated without deleting the refresh token', async () => {
    fetchMock.mockResolvedValue(json(401, { code: 'INVALID_TOKEN' }))
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-2' })

    const res = await POST()

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(cookieJar.get('refresh_token')).toBe('rt-1')
  })

  it('other 401 codes → unauthenticated without deleting the refresh token', async () => {
    fetchMock.mockResolvedValue(json(401, { code: 'UNAUTHENTICATED' }))
    const res = await POST()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(cookieJar.get('refresh_token')).toBe('rt-1')
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('network failure, 5xx, 429 or a malformed 200 → retry', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
    expect(await (await POST()).json()).toEqual({ ok: false, reason: 'retry' })

    fetchMock.mockResolvedValueOnce(json(500, {}))
    expect(await (await POST()).json()).toEqual({ ok: false, reason: 'retry' })

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect(await (await POST()).json()).toEqual({ ok: false, reason: 'retry' })

    fetchMock.mockResolvedValueOnce(json(200, { nope: true }))
    expect(await (await POST()).json()).toEqual({ ok: false, reason: 'retry' })
  })
})
