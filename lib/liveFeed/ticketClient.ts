// Browser side of the stream ticket (handoff §15.1): asks the same-origin
// route handler, which reads the httpOnly session cookie and calls the backend.

import { parseRetryAfterMs } from './streamPolicy'
import type { StreamTicketResult } from './types'

export const TICKET_ENDPOINT = '/api/lives/feed/ticket'
export const TICKET_LOCK_NAME = 'livecomerce:lives-feed-ticket'
/**
 * Client-side bound for the ticket request. The route handler's worst case is
 * ~10 s (5 s ticket call + 5 s session refresh); this stays well above it so
 * the client never aborts while a rotated refresh cookie is still in flight,
 * yet a stuck call cannot hold the cross-tab lock forever.
 */
export const TICKET_FETCH_TIMEOUT_MS = 20_000

type LockManagerLike = {
  request: (name: string, options: { signal?: AbortSignal }, callback: () => Promise<unknown>) => Promise<unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

export function parseTicketResponse(status: number, body: unknown, retryAfter: string | null): StreamTicketResult {
  if (isRecord(body)) {
    if (body.ok === true && typeof body.ticket === 'string' && body.ticket !== '' && status === 200) {
      return { ok: true, ticket: body.ticket }
    }
    if (body.ok === false) {
      if (body.reason === 'forbidden') return { ok: false, reason: 'forbidden' }
      if (body.reason === 'unauthenticated') return { ok: false, reason: 'unauthenticated' }
      if (body.reason === 'retry') {
        return typeof body.retryAfterMs === 'number'
          ? { ok: false, reason: 'retry', retryAfterMs: body.retryAfterMs }
          : { ok: false, reason: 'retry' }
      }
    }
  }
  if (status === 401) return { ok: false, reason: 'unauthenticated' }
  if (status === 403) return { ok: false, reason: 'forbidden' }
  if (status === 503) return { ok: false, reason: 'retry', retryAfterMs: parseRetryAfterMs(retryAfter) }
  return { ok: false, reason: 'retry' }
}

/**
 * Aborts on the caller's signal or after `timeoutMs`, whichever comes first.
 * Built by hand (not AbortSignal.timeout/any) so the timer is cleared as soon
 * as the request settles and no feature detection is needed.
 */
function boundedSignal(timeoutMs: number, caller?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const ctrl = new AbortController()
  const onCallerAbort = () => ctrl.abort(caller?.reason)
  const timer = setTimeout(() => ctrl.abort(new DOMException('Ticket request timed out', 'TimeoutError')), timeoutMs)
  if (caller?.aborted) onCallerAbort()
  else caller?.addEventListener('abort', onCallerAbort, { once: true })
  return {
    signal: ctrl.signal,
    dispose: () => {
      clearTimeout(timer)
      caller?.removeEventListener('abort', onCallerAbort)
    },
  }
}

/**
 * A timeout or caller abort resolves to `retry`; the caller (liveFeedClient)
 * checks its own run signal afterwards, so an abort from stop()/pause() ends
 * the loop instead of retrying.
 */
export async function fetchStreamTicket(fetchImpl: typeof fetch = fetch, signal?: AbortSignal): Promise<StreamTicketResult> {
  const bounded = boundedSignal(TICKET_FETCH_TIMEOUT_MS, signal)
  try {
    let res: Response
    try {
      res = await fetchImpl(TICKET_ENDPOINT, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: bounded.signal,
      })
    } catch {
      return { ok: false, reason: 'retry' }
    }
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      /* non-JSON (e.g. an HTML error page) or aborted body read: classify by status */
    }
    return parseTicketResponse(res.status, body, res.headers.get('Retry-After'))
  } finally {
    bounded.dispose()
  }
}

function browserLocks(): LockManagerLike | undefined {
  return typeof navigator !== 'undefined' ? (navigator.locks as LockManagerLike | undefined) : undefined
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

/**
 * Serializes ticket requests across tabs (Web Locks) so several tabs do not
 * stampede the ticket endpoint and the session refresh behind it. Without
 * Web Locks (insecure origin, old browser) the call runs directly.
 *
 * `signal` (stop/pause) removes a queued request from the lock queue; the
 * returned promise then rejects with the abort reason and `fn` never runs.
 */
export async function withTicketLock<T>(
  fn: () => Promise<T>,
  locks: LockManagerLike | undefined = browserLocks(),
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted()
  if (!locks || typeof locks.request !== 'function') return fn()
  let started = false
  try {
    return (await locks.request(TICKET_LOCK_NAME, signal ? { signal } : {}, () => {
      started = true
      return fn()
    })) as T
  } catch (err) {
    // An aborted wait is a stop, not "Web Locks unavailable": never fall back to fn().
    if (started || signal?.aborted || isAbortError(err)) throw err
    return fn()
  }
}
