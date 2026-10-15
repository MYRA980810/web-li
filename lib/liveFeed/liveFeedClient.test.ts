import { describe, expect, it, vi } from 'vitest'
import { LiveFeedClient, type FeedEvent, type OpenStream, type OpenStreamParams } from './liveFeedClient'
import type { LiveFeedCard, SseMessage, StreamOutcome, StreamTicketResult } from './types'

function card(id: string): LiveFeedCard {
  return {
    id,
    sellerId: 's',
    storeId: null,
    title: id,
    sellerName: null,
    thumbnailUrl: null,
    currentViewers: 3,
    startedAt: '2026-10-07T18:00:00Z',
    categoryId: null,
  }
}

const snapshot = (version: number, ids: string[]): SseMessage => ({
  event: 'snapshot',
  data: JSON.stringify({ version, cards: ids.map(card), counts: [] }),
})
const added = (seq: number, id: string): SseMessage => ({
  event: 'live-added',
  data: JSON.stringify({ type: 'live-added', seq, card: card(id), counts: [] }),
})

type Step = (p: OpenStreamParams) => StreamOutcome | Promise<StreamOutcome>

/** Feeds scripted messages, then ends with the given outcome. */
function script(messages: SseMessage[], end: StreamOutcome, opened = true): Step {
  return (p) => {
    if (opened) p.onOpen()
    for (const m of messages) {
      const stop = p.onMessage(m)
      if (stop) return stop
    }
    return end
  }
}

/** Holds the connection until aborted. */
const hang: Step = (p) => {
  p.onOpen()
  return new Promise((resolve) => p.signal.addEventListener('abort', () => resolve({ kind: 'aborted' }), { once: true }))
}

function setup(steps: Step[], tickets: StreamTicketResult[] = [], now?: () => number) {
  const calls: OpenStreamParams[] = []
  const delays: number[] = []
  let i = 0
  const openStream: OpenStream = vi.fn(async (p: OpenStreamParams) => {
    calls.push(p)
    const step = steps[i++] ?? hang
    return step(p)
  })
  let t = 0
  const getTicket = vi.fn<(signal: AbortSignal) => Promise<StreamTicketResult>>(
    async () => tickets[t++] ?? { ok: true, ticket: `tkt-${t}` },
  )
  const client = new LiveFeedClient({
    getTicket,
    openStream,
    sleep: async (ms) => {
      delays.push(ms)
    },
    random: () => 0.5,
    now,
  })
  const events: FeedEvent[] = []
  client.subscribe((e) => events.push(e))
  return { client, calls, delays, getTicket, openStream, events }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('LiveFeedClient: connect and apply', () => {
  it('first connection: new ticket, no Last-Event-ID; snapshot opens the feed', async () => {
    const { client, calls, events } = setup([script([snapshot(10, ['a', 'b'])], { kind: 'aborted' })])
    client.start()
    await flush()

    expect(calls[0].ticket).toBe('tkt-1')
    expect(calls[0].lastEventId).toBeUndefined()
    expect(client.getStatus()).toBe('open')
    expect([...client.getFeed().cards.keys()]).toEqual(['a', 'b'])
    expect(events.find((e) => e.type === 'snapshot')).toBeDefined()
  })

  it('emits added events with the live id', async () => {
    const { client, events } = setup([script([snapshot(10, []), added(11, 'x')], { kind: 'aborted' })])
    client.start()
    await flush()
    expect(events).toContainEqual(expect.objectContaining({ type: 'added', liveId: 'x' }))
    expect(client.getFeed().version).toBe(11)
  })

  it('server close → new ticket and resume with Last-Event-ID = local version', async () => {
    const { client, calls, getTicket } = setup([script([snapshot(10, ['a']), added(11, 'b')], { kind: 'closed' })])
    client.start()
    await flush()

    expect(getTicket).toHaveBeenCalledTimes(2)
    expect(calls[1].ticket).toBe('tkt-2')
    expect(calls[1].lastEventId).toBe('11')
    // Resuming: the server may skip the snapshot, so the base is trusted on open.
    expect(client.getStatus()).toBe('open')
  })

  it('resync → keeps cards on screen, waits the server retry, reconnects without Last-Event-ID', async () => {
    const { client, calls, delays } = setup([
      script([snapshot(10, ['a']), { event: 'resync', data: '{"type":"resync","seq":0}', retry: 16000 }], {
        kind: 'closed',
      }),
      (p) => {
        expect([...client.getFeed().cards.keys()]).toEqual(['a'])
        return hang(p)
      },
    ])
    client.start()
    await flush()

    expect(delays[0]).toBe(16000)
    expect(calls[1].lastEventId).toBeUndefined()
  })

  it('gap → reconnect without Last-Event-ID', async () => {
    const { client, calls } = setup([script([snapshot(10, []), added(15, 'z')], { kind: 'closed' })])
    client.start()
    await flush()
    expect(calls[1].lastEventId).toBeUndefined()
    expect(client.getFeed().version).toBe(10)
  })

  it('ticket-invalid on the stream → fetches a new ticket and keeps resuming', async () => {
    const { client, calls, getTicket } = setup([
      script([snapshot(10, [])], { kind: 'closed' }),
      script([], { kind: 'ticket-invalid' }, false),
    ])
    client.start()
    await flush()
    expect(getTicket).toHaveBeenCalledTimes(3)
    expect(calls[2].lastEventId).toBe('10')
  })
})

describe('LiveFeedClient: connection lifetime', () => {
  /** Manual clock: each stream step advances it by its own lifetime. */
  function clock() {
    let t = 0
    return { now: () => t, advance: (ms: number) => (t += ms) }
  }

  function livesFor(c: ReturnType<typeof clock>, ms: number, end: StreamOutcome): Step {
    return (p) => {
      p.onOpen()
      c.advance(ms)
      return end
    }
  }

  it('proxy closing right after open → growing backoff, not a reconnect every second', async () => {
    const c = clock()
    const short = livesFor(c, 200, { kind: 'closed' })
    const { client, delays } = setup([short, short, short, short], [], c.now)
    client.start()
    await flush()

    // random 0.5 × min(30 s, 1 s × 2^failures)
    expect(delays.slice(0, 4)).toEqual([1000, 2000, 4000, 8000])
  })

  it('long-lived clean close (server 14 min lifetime) → short jitter and counters reset', async () => {
    const c = clock()
    const { client, delays } = setup(
      [livesFor(c, 200, { kind: 'closed' }), livesFor(c, 200, { kind: 'closed' }), livesFor(c, 14 * 60_000, { kind: 'closed' }), livesFor(c, 200, { kind: 'closed' })],
      [],
      c.now,
    )
    client.start()
    await flush()

    expect(delays.slice(0, 4)).toEqual([1000, 2000, 500, 1000])
  })

  it('a stream that never opened is not credited a lifetime', async () => {
    const c = clock()
    const { client, delays } = setup([script([], { kind: 'closed' }, false)], [], c.now)
    client.start()
    await flush()
    expect(delays[0]).toBe(1000)
  })
})

describe('LiveFeedClient: ticket failures', () => {
  it('forbidden ticket → terminal, stream never opened', async () => {
    const { client, openStream } = setup([], [{ ok: false, reason: 'forbidden' }])
    client.start()
    await flush()
    expect(client.getStatus()).toBe('forbidden')
    expect(openStream).not.toHaveBeenCalled()
  })

  it('unauthenticated ticket → terminal', async () => {
    const { client } = setup([], [{ ok: false, reason: 'unauthenticated' }])
    client.start()
    await flush()
    expect(client.getStatus()).toBe('unauthenticated')
  })

  it('403 on the stream → terminal, no further tickets', async () => {
    const { client, getTicket } = setup([script([], { kind: 'forbidden' }, false)])
    client.start()
    await flush()
    expect(client.getStatus()).toBe('forbidden')
    expect(getTicket).toHaveBeenCalledTimes(1)
  })

  it('503 from the ticket endpoint waits at least Retry-After, then asks for a new ticket', async () => {
    const { client, delays, getTicket, calls } = setup([], [{ ok: false, reason: 'retry', retryAfterMs: 5000 }])
    client.start()
    await flush()
    expect(delays[0]).toBeGreaterThanOrEqual(5000)
    expect(getTicket).toHaveBeenCalledTimes(2)
    expect(calls).toHaveLength(1)
  })

  it('a throwing ticket fetch is treated as transient', async () => {
    const { client, getTicket, calls } = setup([])
    getTicket.mockRejectedValueOnce(new Error('boom'))
    client.start()
    await flush()
    expect(calls).toHaveLength(1)
  })
})

describe('LiveFeedClient: lifecycle', () => {
  it('stop() aborts, clears the feed and never reconnects', async () => {
    const { client, calls, getTicket } = setup([
      (p) => {
        p.onOpen()
        p.onMessage(snapshot(10, ['a']))
        return hang(p)
      },
    ])
    client.start()
    await flush()
    client.stop()
    await flush()

    expect(calls[0].signal.aborted).toBe(true)
    expect(client.getStatus()).toBe('stopped')
    expect(client.getFeed().cards.size).toBe(0)
    expect(getTicket).toHaveBeenCalledTimes(1)
  })

  it('pause() keeps the cards; resume() reconnects with a new ticket and Last-Event-ID', async () => {
    const { client, calls } = setup([
      (p) => {
        p.onOpen()
        p.onMessage(snapshot(10, ['a']))
        return hang(p)
      },
    ])
    client.start()
    await flush()
    client.pause()
    await flush()

    expect(calls[0].signal.aborted).toBe(true)
    expect(client.getStatus()).toBe('reconnecting')
    expect(client.getFeed().cards.size).toBe(1)

    client.resume()
    await flush()
    expect(calls).toHaveLength(2)
    expect(calls[1].lastEventId).toBe('10')
  })

  it('resume() does nothing after a terminal stop', async () => {
    const { client, getTicket } = setup([], [{ ok: false, reason: 'forbidden' }])
    client.start()
    await flush()
    client.resume()
    await flush()
    expect(getTicket).toHaveBeenCalledTimes(1)
  })

  it('passes the run signal to getTicket; stop() aborts it and a late ticket is never used', async () => {
    const { client, getTicket, openStream } = setup([])
    let release: (r: StreamTicketResult) => void = () => {}
    getTicket.mockImplementationOnce(() => new Promise((resolve) => (release = resolve)))
    client.start()
    await flush()

    const signal = getTicket.mock.calls[0][0]
    expect(signal.aborted).toBe(false)
    client.stop()
    expect(signal.aborted).toBe(true)

    release({ ok: true, ticket: 'late' })
    await flush()
    expect(openStream).not.toHaveBeenCalled()
    expect(client.getStatus()).toBe('stopped')
  })

  it('pause() aborts a ticket wait; an aborted getTicket is a stop, not a retry', async () => {
    const { client, getTicket, delays } = setup([])
    getTicket.mockImplementationOnce(
      (signal: AbortSignal) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true }),
        ),
    )
    client.start()
    await flush()
    client.pause()
    await flush()

    expect(getTicket.mock.calls[0][0].aborted).toBe(true)
    expect(getTicket).toHaveBeenCalledTimes(1)
    expect(delays).toHaveLength(0)
  })

  it('start() twice keeps a single connection', async () => {
    const { client, getTicket } = setup([])
    client.start()
    client.start()
    await flush()
    expect(getTicket).toHaveBeenCalledTimes(1)
  })
})
