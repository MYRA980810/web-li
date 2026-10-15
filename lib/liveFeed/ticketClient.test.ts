import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchStreamTicket,
  parseTicketResponse,
  TICKET_FETCH_TIMEOUT_MS,
  TICKET_LOCK_NAME,
  withTicketLock,
} from './ticketClient'

type LockCallback = () => Promise<unknown>
type LockOptions = { signal?: AbortSignal }

/** Never-settling fetch that rejects like the platform when its signal aborts. */
function hangingFetch() {
  return vi.fn(
    (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal
        signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
      }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseTicketResponse', () => {
  it('200 with a ticket → ok', () => {
    expect(parseTicketResponse(200, { ok: true, ticket: 'abc' }, null)).toEqual({ ok: true, ticket: 'abc' })
  })

  it('passes through the route handler failure bodies', () => {
    expect(parseTicketResponse(403, { ok: false, reason: 'forbidden' }, null)).toEqual({ ok: false, reason: 'forbidden' })
    expect(parseTicketResponse(401, { ok: false, reason: 'unauthenticated' }, null)).toEqual({
      ok: false,
      reason: 'unauthenticated',
    })
    expect(parseTicketResponse(503, { ok: false, reason: 'retry', retryAfterMs: 5000 }, '5')).toEqual({
      ok: false,
      reason: 'retry',
      retryAfterMs: 5000,
    })
    expect(parseTicketResponse(503, { ok: false, reason: 'retry' }, null)).toEqual({ ok: false, reason: 'retry' })
  })

  it('unexpected bodies fall back to the status', () => {
    expect(parseTicketResponse(200, { ok: true, ticket: '' }, null)).toEqual({ ok: false, reason: 'retry' })
    expect(parseTicketResponse(401, '<html>', null)).toEqual({ ok: false, reason: 'unauthenticated' })
    expect(parseTicketResponse(403, null, null)).toEqual({ ok: false, reason: 'forbidden' })
    expect(parseTicketResponse(503, null, '9')).toEqual({ ok: false, reason: 'retry', retryAfterMs: 9000 })
    expect(parseTicketResponse(500, null, null)).toEqual({ ok: false, reason: 'retry' })
  })
})

describe('fetchStreamTicket', () => {
  it('POSTs same-origin without caching and parses the body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, ticket: 't-1' }), { status: 200, headers: { 'content-type': 'application/json' } }),
    )
    const result = await fetchStreamTicket(fetchMock)

    expect(result).toEqual({ ok: true, ticket: 't-1' })
    expect(fetchMock).toHaveBeenCalledWith('/api/lives/feed/ticket', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      signal: expect.any(AbortSignal),
    })
  })

  it('times out a hanging ticket request → retry', async () => {
    vi.useFakeTimers()
    try {
      const pending = fetchStreamTicket(hangingFetch())
      await vi.advanceTimersByTimeAsync(TICKET_FETCH_TIMEOUT_MS)
      expect(await pending).toEqual({ ok: false, reason: 'retry' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('caller abort cancels the request → retry (the caller sees its own aborted signal and stops)', async () => {
    const fetchMock = hangingFetch()
    const ctrl = new AbortController()
    const pending = fetchStreamTicket(fetchMock, ctrl.signal)
    ctrl.abort()
    expect(await pending).toEqual({ ok: false, reason: 'retry' })
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.signal?.aborted).toBe(true)
  })

  it('network failure → retry', async () => {
    const result = await fetchStreamTicket(vi.fn().mockRejectedValue(new TypeError('offline')))
    expect(result).toEqual({ ok: false, reason: 'retry' })
  })

  it('non-JSON body → falls back to the status', async () => {
    const result = await fetchStreamTicket(vi.fn().mockResolvedValue(new Response('<html>', { status: 401 })))
    expect(result).toEqual({ ok: false, reason: 'unauthenticated' })
  })
})

describe('withTicketLock', () => {
  it('runs inside navigator.locks when available, passing the abort signal to the queue', async () => {
    const request = vi.fn((_name: string, _opts: LockOptions, cb: LockCallback) => cb())
    const ctrl = new AbortController()
    const result = await withTicketLock(async () => 'done', { request }, ctrl.signal)
    expect(result).toBe('done')
    expect(request).toHaveBeenCalledWith(TICKET_LOCK_NAME, { signal: ctrl.signal }, expect.any(Function))
  })

  it('an aborted wait leaves the queue and never runs fn (not a "Web Locks unavailable" fallback)', async () => {
    // Mirrors navigator.locks: a queued request rejects with AbortError when its signal aborts.
    const request = vi.fn(
      (_name: string, opts: LockOptions) =>
        new Promise<unknown>((_resolve, reject) => {
          opts.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
        }),
    )
    const fn = vi.fn(async () => 'ran')
    const ctrl = new AbortController()
    const pending = withTicketLock(fn, { request }, ctrl.signal)
    ctrl.abort()

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('an already-aborted signal never runs fn, even without Web Locks', async () => {
    const fn = vi.fn(async () => 'ran')
    const ctrl = new AbortController()
    ctrl.abort()
    await expect(withTicketLock(fn, undefined, ctrl.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('serializes concurrent callers through the lock', async () => {
    let chain = Promise.resolve()
    const request = (_name: string, _opts: LockOptions, cb: LockCallback) => {
      const run = chain.then(cb)
      chain = run.then(() => undefined, () => undefined)
      return run
    }
    const order: string[] = []
    const task = (id: string) => async () => {
      order.push(`start-${id}`)
      await new Promise((r) => setTimeout(r, 5))
      order.push(`end-${id}`)
      return id
    }
    await Promise.all([withTicketLock(task('a'), { request }), withTicketLock(task('b'), { request })])
    expect(order).toEqual(['start-a', 'end-a', 'start-b', 'end-b'])
  })

  it('falls back to a direct call without Web Locks', async () => {
    expect(await withTicketLock(async () => 'direct', undefined)).toBe('direct')
  })

  it('falls back to a direct call when the lock manager throws', async () => {
    const request = vi.fn(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(await withTicketLock(async () => 'direct', { request })).toBe('direct')
  })
})
