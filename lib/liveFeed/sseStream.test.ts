import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openSseStream, type OpenSseStreamArgs } from './sseStream'
import type { SseMessage, StreamOutcome } from './types'

const URL_ = 'https://api.test/api/lives/feed/stream'

beforeEach(() => {
  // fetch-event-source touches window timers and document listeners even with openWhenHidden.
  vi.stubGlobal('window', globalThis)
  vi.stubGlobal('document', { addEventListener: () => {}, removeEventListener: () => {}, hidden: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function sseBody(text: string, keepOpen = false): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      if (!keepOpen) controller.close()
    },
  })
}

function sseResponse(text: string, keepOpen = false): Response {
  return new Response(sseBody(text, keepOpen), {
    status: 200,
    headers: { 'content-type': 'text/event-stream;charset=UTF-8' },
  })
}

function problem(status: number, code?: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ status, code }), {
    status,
    headers: { 'content-type': 'application/problem+json', ...headers },
  })
}

function args(fetchMock: ReturnType<typeof vi.fn>, over: Partial<OpenSseStreamArgs> = {}): OpenSseStreamArgs {
  return {
    url: URL_,
    ticket: 'tkt',
    signal: new AbortController().signal,
    onOpen: vi.fn(),
    onMessage: vi.fn(() => null),
    fetch: fetchMock as unknown as typeof fetch,
    ...over,
  }
}

describe('openSseStream: request', () => {
  it('sends the ticket and Accept, no credentials, no Last-Event-ID by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(':connected\n\n'))
    await openSseStream(args(fetchMock))

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(URL_)
    expect(init.headers).toEqual({ 'X-Stream-Ticket': 'tkt', accept: 'text/event-stream' })
    expect(init.credentials).toBe('omit')
    expect(init.method).toBe('GET')
  })

  it('adds Last-Event-ID when resuming', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(':connected\n\n'))
    await openSseStream(args(fetchMock, { lastEventId: '42' }))
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.headers).toMatchObject({ 'Last-Event-ID': '42' })
  })
})

describe('openSseStream: stream lifecycle', () => {
  it('delivers frames and resolves closed when the server ends the stream', async () => {
    const messages: SseMessage[] = []
    const onOpen = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse(':connected\n\nid:7\nevent:snapshot\ndata:{"version":7,"cards":[],"counts":[]}\n\n'),
    )
    const outcome = await openSseStream(
      args(fetchMock, {
        onOpen,
        onMessage: (m) => {
          messages.push({ event: m.event, data: m.data })
          return null
        },
      }),
    )

    expect(outcome).toEqual({ kind: 'closed' })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(messages).toContainEqual({ event: 'snapshot', data: '{"version":7,"cards":[],"counts":[]}' })
  })

  it('passes the retry field of a resync frame', async () => {
    let seen: SseMessage | undefined
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(':connected\n\nretry:17342\nevent:resync\ndata:{"type":"resync","seq":0}\n\n'))
    await openSseStream(
      args(fetchMock, {
        onMessage: (m) => {
          if (m.event === 'resync') seen = m
          return null
        },
      }),
    )
    expect(seen?.retry).toBe(17342)
  })

  it('ends with the outcome returned by onMessage and stops reading', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse('event:resync\ndata:{}\n\n', true))
    const outcome = await openSseStream(
      args(fetchMock, { onMessage: (m): StreamOutcome | null => (m.event === 'resync' ? { kind: 'resync' } : null) }),
    )
    expect(outcome).toEqual({ kind: 'resync' })
  })

  it('resolves aborted when the caller aborts', async () => {
    const ctrl = new AbortController()
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(':connected\n\n', true))
    const pending = openSseStream(args(fetchMock, { signal: ctrl.signal, onOpen: () => ctrl.abort() }))
    expect(await pending).toEqual({ kind: 'aborted' })
  })

  it('watchdog ends a silent connection as an error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(':connected\n\n', true))
    const outcome = await openSseStream(args(fetchMock, { watchdogMs: 20 }))
    expect(outcome).toEqual({ kind: 'error' })
  })
})

describe('openSseStream: non-200 responses (§15.3)', () => {
  it('401 TICKET_INVALID → ticket-invalid', async () => {
    const outcome = await openSseStream(args(vi.fn().mockResolvedValue(problem(401, 'TICKET_INVALID'))))
    expect(outcome).toEqual({ kind: 'ticket-invalid' })
  })

  it('403 → forbidden', async () => {
    expect(await openSseStream(args(vi.fn().mockResolvedValue(problem(403))))).toEqual({ kind: 'forbidden' })
  })

  it('429 → rate-limited', async () => {
    expect(await openSseStream(args(vi.fn().mockResolvedValue(new Response(null, { status: 429 }))))).toEqual({
      kind: 'rate-limited',
    })
  })

  it('503 TICKET_STORE_UNAVAILABLE honors Retry-After', async () => {
    const res = problem(503, 'TICKET_STORE_UNAVAILABLE', { 'Retry-After': '5' })
    expect(await openSseStream(args(vi.fn().mockResolvedValue(res)))).toEqual({ kind: 'unavailable', retryAfterMs: 5000 })
  })

  it('200 with a non event-stream content type → error', async () => {
    const res = new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    expect(await openSseStream(args(vi.fn().mockResolvedValue(res)))).toEqual({ kind: 'error' })
  })

  it('network failure → error, and the library never retries on its own', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    expect(await openSseStream(args(fetchMock))).toEqual({ kind: 'error' })
    await new Promise((r) => setTimeout(r, 1100))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
