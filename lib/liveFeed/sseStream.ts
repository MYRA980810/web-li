// One connection attempt to the feed stream (handoff §7.2, §15.3), on top of
// @microsoft/fetch-event-source. The library is never allowed to retry on its
// own: it would reuse a spent ticket and its own Last-Event-ID.

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { classifyStreamOpen } from './streamPolicy'
import type { SseMessage, StreamOutcome } from './types'

/** No bytes for this long (2.5 server pings) → treat the connection as dead. */
export const DEFAULT_WATCHDOG_MS = 50_000

export type OpenSseStreamArgs = {
  url: string
  ticket: string
  /** Only when resuming from a trusted local version (§5.4). */
  lastEventId?: string
  signal: AbortSignal
  onOpen: () => void
  /** Return an outcome to end the connection (resync, gap). */
  onMessage: (msg: SseMessage) => StreamOutcome | null
  watchdogMs?: number
  /** Injectable for tests. */
  fetch?: typeof fetch
}

class OpenFailure extends Error {
  constructor(readonly outcome: StreamOutcome) {
    super(outcome.kind)
  }
}

async function readProblemCode(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { code?: unknown }
    return typeof body.code === 'string' ? body.code : undefined
  } catch {
    return undefined
  }
}

/** Resolves (never rejects) with why the connection ended. */
export function openSseStream(args: OpenSseStreamArgs): Promise<StreamOutcome> {
  const { signal, watchdogMs = DEFAULT_WATCHDOG_MS } = args
  const ctrl = new AbortController()

  return new Promise<StreamOutcome>((resolve) => {
    let settled = false
    let watchdog: ReturnType<typeof setTimeout> | undefined

    const finish = (outcome: StreamOutcome) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      signal.removeEventListener('abort', onCallerAbort)
      ctrl.abort()
      resolve(outcome)
    }
    function onCallerAbort() {
      finish({ kind: 'aborted' })
    }
    // Every block, including :ping comments (fetch-event-source 2.0.1 calls
    // onmessage with an empty event for comment-only blocks), re-arms it.
    const kick = () => {
      clearTimeout(watchdog)
      watchdog = setTimeout(() => finish({ kind: 'error' }), watchdogMs)
    }

    if (signal.aborted) {
      finish({ kind: 'aborted' })
      return
    }
    signal.addEventListener('abort', onCallerAbort, { once: true })

    // Built from scratch on every attempt; any other header fails the CORS preflight.
    // Lowercase `accept`: the library adds its own unless that exact key exists.
    const headers: Record<string, string> = { 'X-Stream-Ticket': args.ticket, accept: 'text/event-stream' }
    if (args.lastEventId !== undefined) headers['Last-Event-ID'] = args.lastEventId

    fetchEventSource(args.url, {
      method: 'GET',
      headers,
      credentials: 'omit',
      signal: ctrl.signal,
      openWhenHidden: true, // visibility is handled by the caller
      fetch: args.fetch,
      onopen: async (res) => {
        const type = res.headers.get('content-type') ?? ''
        if (res.ok && type.startsWith('text/event-stream')) {
          kick()
          args.onOpen()
          return
        }
        const code = res.status === 401 || res.status === 503 ? await readProblemCode(res) : undefined
        throw new OpenFailure(classifyStreamOpen(res.status, code, res.headers.get('Retry-After')))
      },
      onmessage: (msg) => {
        if (settled) return
        kick()
        const end = args.onMessage({ event: msg.event, data: msg.data, retry: msg.retry })
        if (end) finish(end)
      },
      onclose: () => finish({ kind: 'closed' }),
      onerror: (err) => {
        throw err
      },
    }).then(
      () => finish(signal.aborted ? { kind: 'aborted' } : { kind: 'closed' }),
      (err: unknown) => finish(err instanceof OpenFailure ? err.outcome : { kind: 'error' }),
    )
  })
}
