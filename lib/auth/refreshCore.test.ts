import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  classifyRefreshResponse,
  REFRESH_TIMEOUT_MS,
  extractRefreshTokenFromSetCookie,
  pendingRefreshCount,
  refreshWithSingleFlight,
} from './refreshCore'

function jsonResponse(status: number, body: unknown, setCookie?: string): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (setCookie) headers.append('Set-Cookie', setCookie)
  return new Response(JSON.stringify(body), { status, headers })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('classifyRefreshResponse', () => {
  it('200 with accessToken and rotated cookie is ok', async () => {
    const res = jsonResponse(200, { accessToken: 'at-2' }, 'refresh_token=rt-2; Path=/; HttpOnly')
    await expect(classifyRefreshResponse(res)).resolves.toEqual({
      kind: 'ok',
      accessToken: 'at-2',
      refreshToken: 'rt-2',
    })
  })

  it('200 without Set-Cookie is ok with no refresh token', async () => {
    const res = jsonResponse(200, { accessToken: 'at-2' })
    await expect(classifyRefreshResponse(res)).resolves.toEqual({ kind: 'ok', accessToken: 'at-2' })
  })

  it('200 without an accessToken is invalid', async () => {
    await expect(classifyRefreshResponse(jsonResponse(200, {}))).resolves.toEqual({ kind: 'invalid' })
  })

  it('409 refresh-retry is retryable', async () => {
    const res = jsonResponse(409, { code: 'refresh-retry' })
    await expect(classifyRefreshResponse(res)).resolves.toEqual({ kind: 'retry' })
  })

  it('429 is retryable', async () => {
    await expect(classifyRefreshResponse(jsonResponse(429, {}))).resolves.toEqual({ kind: 'retry' })
  })

  it.each([500, 502, 503, 504])('%i is retryable', async (status) => {
    await expect(classifyRefreshResponse(jsonResponse(status, {}))).resolves.toEqual({ kind: 'retry' })
  })

  it('rethrows an aborted body read instead of classifying it as invalid', async () => {
    const res = new Response(null, { status: 200 })
    vi.spyOn(res, 'json').mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'))
    await expect(classifyRefreshResponse(res)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it.each([400, 401, 403])('%i is invalid', async (status) => {
    await expect(classifyRefreshResponse(jsonResponse(status, {}))).resolves.toEqual({ kind: 'invalid' })
  })
})

describe('extractRefreshTokenFromSetCookie', () => {
  it('finds refresh_token among several Set-Cookie headers', () => {
    const headers = new Headers()
    headers.append('Set-Cookie', 'other=1; Path=/')
    headers.append('Set-Cookie', 'refresh_token=abc.def; Path=/; HttpOnly')
    expect(extractRefreshTokenFromSetCookie(headers)).toBe('abc.def')
  })

  it('returns null when absent', () => {
    expect(extractRefreshTokenFromSetCookie(new Headers())).toBeNull()
  })
})

describe('refreshWithSingleFlight', () => {
  it('network errors are retryable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(refreshWithSingleFlight('rt-net')).resolves.toEqual({ kind: 'retry' })
  })

  it('sends the refresh token as a cookie with the XHR header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { accessToken: 'at' }))
    vi.stubGlobal('fetch', fetchMock)
    await refreshWithSingleFlight('rt-hdr')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/auth\/refresh$/)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Cookie: 'refresh_token=rt-hdr', 'X-Requested-With': 'XMLHttpRequest' })
  })

  it('concurrent calls with the same refresh token share one fetch', async () => {
    const gate = deferred<Response>()
    const fetchMock = vi.fn().mockReturnValue(gate.promise)
    vi.stubGlobal('fetch', fetchMock)

    const calls = [refreshWithSingleFlight('rt-same'), refreshWithSingleFlight('rt-same'), refreshWithSingleFlight('rt-same')]
    // Let the async hashing settle so every caller has joined the flight.
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    gate.resolve(jsonResponse(200, { accessToken: 'at-shared' }, 'refresh_token=rt-next; Path=/'))

    const results = await Promise.all(calls)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    for (const r of results) expect(r).toEqual({ kind: 'ok', accessToken: 'at-shared', refreshToken: 'rt-next' })
  })

  it('removes the entry after settle so a later call fetches again', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(409, {}))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'at-later' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(refreshWithSingleFlight('rt-settle')).resolves.toEqual({ kind: 'retry' })
    expect(pendingRefreshCount()).toBe(0)
    await expect(refreshWithSingleFlight('rt-settle')).resolves.toEqual({ kind: 'ok', accessToken: 'at-later' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(pendingRefreshCount()).toBe(0)
  })

  it('a hung refresh times out as retry and frees the single-flight entry', async () => {
    vi.useFakeTimers()
    try {
      const fetchMock = vi.fn((_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')))
        }),
      )
      vi.stubGlobal('fetch', fetchMock)

      const first = refreshWithSingleFlight('rt-hung')
      const joined = refreshWithSingleFlight('rt-hung')
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
      expect(pendingRefreshCount()).toBe(1)

      await vi.advanceTimersByTimeAsync(REFRESH_TIMEOUT_MS)

      await expect(first).resolves.toEqual({ kind: 'retry' })
      await expect(joined).resolves.toEqual({ kind: 'retry' })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(pendingRefreshCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('different refresh tokens use separate fetches', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(200, { accessToken: 'at' }))
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([refreshWithSingleFlight('rt-a'), refreshWithSingleFlight('rt-b')])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
