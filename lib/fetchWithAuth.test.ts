import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cookieJar = new Map<string, string>()
// Mirrors Next: cookies() is only writable in Server Functions / Route Handlers.
let renderContext = false
function assertWritable() {
  if (renderContext) throw new Error('Cookies can only be modified in a Server Action or Route Handler.')
}
const cookieStore = {
  get: vi.fn((name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined)),
  set: vi.fn((name: string, value: string) => { assertWritable(); cookieJar.set(name, value) }),
  delete: vi.fn((name: string) => { assertWritable(); cookieJar.delete(name) }),
}
const requestHeaders = new Headers()

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
  headers: async () => requestHeaders,
}))

class RedirectSignal extends Error {
  constructor(public readonly url: string) { super(`NEXT_REDIRECT ${url}`) }
}
const redirectMock = vi.fn((url: string) => { throw new RedirectSignal(url) })
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}))

const refreshMock = vi.fn()
vi.mock('./auth/refreshCore', () => ({
  refreshWithSingleFlight: (rt: string) => refreshMock(rt),
}))

const { fetchWithAuth } = await import('./fetchWithAuth')
const { SessionRetryError } = await import('./auth/sessionRetry')

const API_URL = 'http://api.test/api/thing'

function tokenExpired(): Response {
  return new Response(JSON.stringify({ code: 'TOKEN_EXPIRED' }), { status: 401 })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  renderContext = false
  requestHeaders.delete('x-pathname')
  cookieJar.clear()
  cookieJar.set('session', 'at-old')
  cookieJar.set('refresh_token', 'rt-old')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('fetchWithAuth in an action context', () => {
  it('returns non-401 responses untouched', async () => {
    fetchMock.mockResolvedValue(new Response('ok', { status: 200 }))
    const res = await fetchWithAuth(API_URL, { method: 'GET' }, 'at-old')
    expect(res.status).toBe(200)
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('ok refresh → persists both cookies and retries once with the new token', async () => {
    fetchMock.mockResolvedValueOnce(tokenExpired()).mockResolvedValueOnce(new Response('ok', { status: 200 }))
    refreshMock.mockResolvedValue({ kind: 'ok', accessToken: 'at-new', refreshToken: 'rt-new' })

    const res = await fetchWithAuth(API_URL, { method: 'GET' }, 'at-old')

    expect(res.status).toBe(200)
    expect(refreshMock).toHaveBeenCalledWith('rt-old')
    expect(cookieJar.get('session')).toBe('at-new')
    expect(cookieJar.get('refresh_token')).toBe('rt-new')
    const retryInit = fetchMock.mock.calls[1][1] as RequestInit
    expect(retryInit.headers).toMatchObject({ Authorization: 'Bearer at-new' })
  })

  it('reuses a session another call in this request already refreshed', async () => {
    cookieJar.set('session', 'at-fresh')
    fetchMock.mockResolvedValueOnce(tokenExpired()).mockResolvedValueOnce(new Response('ok', { status: 200 }))

    await fetchWithAuth(API_URL, { method: 'GET' }, 'at-old')

    expect(refreshMock).not.toHaveBeenCalled()
    expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toMatchObject({ Authorization: 'Bearer at-fresh' })
  })

  it('retryable refresh → throws SessionRetryError and keeps the cookies', async () => {
    fetchMock.mockResolvedValue(tokenExpired())
    refreshMock.mockResolvedValue({ kind: 'retry' })

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, 'at-old')).rejects.toBeInstanceOf(SessionRetryError)
    expect(cookieStore.delete).not.toHaveBeenCalledWith('session')
    expect(cookieJar.get('refresh_token')).toBe('rt-old')
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('invalid refresh → clears cookies and redirects to /login', async () => {
    fetchMock.mockResolvedValue(tokenExpired())
    refreshMock.mockResolvedValue({ kind: 'invalid' })

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, 'at-old')).rejects.toBeInstanceOf(RedirectSignal)
    expect(redirectMock).toHaveBeenCalledWith('/login')
    expect(cookieJar.has('session')).toBe(false)
    expect(cookieJar.has('refresh_token')).toBe(false)
  })
})

function jwtExpiringIn(seconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + seconds
  return `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: 'u1', exp })).toString('base64url')}.sig`
}

describe('fetchWithAuth during a Server Component render', () => {
  beforeEach(() => {
    renderContext = true
  })

  it('never calls the refresh endpoint and redirects to the same path for the middleware to refresh', async () => {
    const expired = jwtExpiringIn(-5)
    cookieJar.set('session', expired)
    requestHeaders.set('x-pathname', '/buyer/lives?cat=a')
    fetchMock.mockResolvedValue(tokenExpired())

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, expired)).rejects.toBeInstanceOf(RedirectSignal)

    expect(refreshMock).not.toHaveBeenCalled()
    expect(redirectMock).toHaveBeenCalledWith('/buyer/lives?cat=a')
    expect(cookieJar.get('refresh_token')).toBe('rt-old')
  })

  it('logs out when the path is not covered by the middleware (no x-pathname)', async () => {
    const expired = jwtExpiringIn(-5)
    cookieJar.set('session', expired)
    fetchMock.mockResolvedValue(tokenExpired())

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, expired)).rejects.toBeInstanceOf(RedirectSignal)

    expect(refreshMock).not.toHaveBeenCalled()
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('logs out instead of looping when the middleware would not refresh this token', async () => {
    const notDue = jwtExpiringIn(3600)
    cookieJar.set('session', notDue)
    requestHeaders.set('x-pathname', '/buyer/lives')
    fetchMock.mockResolvedValue(tokenExpired())

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, notDue)).rejects.toBeInstanceOf(RedirectSignal)

    expect(refreshMock).not.toHaveBeenCalled()
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('ignores an unsafe x-pathname', async () => {
    const expired = jwtExpiringIn(-5)
    cookieJar.set('session', expired)
    requestHeaders.set('x-pathname', '//evil.test/')
    fetchMock.mockResolvedValue(tokenExpired())

    await expect(fetchWithAuth(API_URL, { method: 'GET' }, expired)).rejects.toBeInstanceOf(RedirectSignal)
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})
