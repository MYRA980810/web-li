import { describe, expect, it } from 'vitest'
import {
  classifyStreamOpen,
  INITIAL_COUNTERS,
  MIN_HEALTHY_CONNECTION_MS,
  parseRetryAfterMs,
  planNext,
  ticketFailureOutcome,
  type RetryCounters,
} from './streamPolicy'

const half = () => 0.5
const zero = () => 0

describe('parseRetryAfterMs', () => {
  it('reads delta-seconds', () => {
    expect(parseRetryAfterMs('5')).toBe(5000)
    expect(parseRetryAfterMs(' 12 ')).toBe(12000)
  })

  it('falls back to 5 s when missing or unreadable (§15.3)', () => {
    expect(parseRetryAfterMs(null)).toBe(5000)
    expect(parseRetryAfterMs('')).toBe(5000)
    expect(parseRetryAfterMs('soon')).toBe(5000)
    expect(parseRetryAfterMs('-3')).toBe(5000)
  })
})

describe('classifyStreamOpen (§15.3 status table)', () => {
  it('401 TICKET_INVALID → new ticket', () => {
    expect(classifyStreamOpen(401, 'TICKET_INVALID', null)).toEqual({ kind: 'ticket-invalid' })
  })

  it('any other 401 also goes back for a new ticket (the ticket endpoint does the real auth check)', () => {
    expect(classifyStreamOpen(401, 'UNAUTHENTICATED', null)).toEqual({ kind: 'ticket-invalid' })
    expect(classifyStreamOpen(401, undefined, null)).toEqual({ kind: 'ticket-invalid' })
  })

  it('403 → terminal forbidden', () => {
    expect(classifyStreamOpen(403, undefined, null)).toEqual({ kind: 'forbidden' })
  })

  it('429 → rate limited', () => {
    expect(classifyStreamOpen(429, undefined, null)).toEqual({ kind: 'rate-limited' })
  })

  it('503 → unavailable honoring Retry-After, 5 s fallback', () => {
    expect(classifyStreamOpen(503, 'TICKET_STORE_UNAVAILABLE', '7')).toEqual({ kind: 'unavailable', retryAfterMs: 7000 })
    expect(classifyStreamOpen(503, 'TICKET_STORE_UNAVAILABLE', null)).toEqual({ kind: 'unavailable', retryAfterMs: 5000 })
  })

  it('other statuses (500, 502, 200 with a wrong content type) → error', () => {
    expect(classifyStreamOpen(500, undefined, null)).toEqual({ kind: 'error' })
    expect(classifyStreamOpen(502, undefined, null)).toEqual({ kind: 'error' })
    expect(classifyStreamOpen(200, undefined, null)).toEqual({ kind: 'error' })
  })
})

describe('ticketFailureOutcome (§15.2)', () => {
  it('forbidden and unauthenticated are terminal', () => {
    expect(ticketFailureOutcome({ ok: false, reason: 'forbidden' })).toEqual({ kind: 'forbidden' })
    expect(ticketFailureOutcome({ ok: false, reason: 'unauthenticated' })).toEqual({ kind: 'unauthenticated' })
  })

  it('retry with Retry-After → unavailable with that wait', () => {
    expect(ticketFailureOutcome({ ok: false, reason: 'retry', retryAfterMs: 5000 })).toEqual({
      kind: 'unavailable',
      retryAfterMs: 5000,
    })
  })

  it('retry without Retry-After (409 refresh-retry) → short ~500 ms base wait', () => {
    expect(ticketFailureOutcome({ ok: false, reason: 'retry' })).toEqual({ kind: 'unavailable', retryAfterMs: 500 })
  })
})

describe('planNext', () => {
  const c = (over: Partial<RetryCounters> = {}): RetryCounters => ({ ...INITIAL_COUNTERS, ...over })

  it('forbidden / unauthenticated stop the feed', () => {
    expect(planNext({ kind: 'forbidden' }, c(), half)).toEqual({ action: 'stop', status: 'forbidden' })
    expect(planNext({ kind: 'unauthenticated' }, c(), half)).toEqual({ action: 'stop', status: 'unauthenticated' })
  })

  it('aborted stops without a status change', () => {
    expect(planNext({ kind: 'aborted' }, c(), half)).toEqual({ action: 'stop', status: null })
  })

  it('normal close (long-lived) → resume with Last-Event-ID after a 0–1 s jitter, counters reset', () => {
    const plan = planNext({ kind: 'closed' }, c({ failures: 4, resyncStreak: 2 }), half, 14 * 60_000)
    expect(plan).toEqual({
      action: 'reconnect',
      delayMs: 500,
      resume: true,
      counters: { failures: 0, rateLimited: 0, resyncStreak: 0 },
    })
  })

  it('a close exactly at the healthy threshold counts as a normal close', () => {
    const plan = planNext({ kind: 'closed' }, c({ failures: 3 }), half, MIN_HEALTHY_CONNECTION_MS)
    expect(plan).toMatchObject({ delayMs: 500, counters: { failures: 0 } })
  })

  it('short-lived close → counts as a failure with exponential backoff, counters kept', () => {
    const plan = planNext({ kind: 'closed' }, c({ failures: 2, resyncStreak: 1 }), () => 1, 200)
    expect(plan).toEqual({
      action: 'reconnect',
      delayMs: 8000,
      resume: true,
      counters: { failures: 3, rateLimited: 0, resyncStreak: 1 },
    })
  })

  it('a close with an unknown lifetime is treated as short-lived', () => {
    expect(planNext({ kind: 'closed' }, c(), () => 1)).toMatchObject({ delayMs: 2000, counters: { failures: 1 } })
  })

  it('repeated short-lived closes back off up to the 30 s cap instead of reconnecting every second', () => {
    let counters = c()
    const delays: number[] = []
    for (let i = 0; i < 10; i++) {
      const plan = planNext({ kind: 'closed' }, counters, () => 1, 1_000)
      if (plan.action !== 'reconnect') throw new Error('expected reconnect')
      delays.push(plan.delayMs)
      counters = plan.counters
    }
    expect(delays.slice(0, 4)).toEqual([2000, 4000, 8000, 16000])
    expect(delays.at(-1)).toBe(30_000)
  })

  it('a healthy connection resets failures before planning the next error', () => {
    const plan = planNext({ kind: 'error' }, c({ failures: 6 }), () => 1, MIN_HEALTHY_CONNECTION_MS + 1)
    expect(plan).toMatchObject({ delayMs: 2000, counters: { failures: 1 } })
  })

  it('a short-lived connection keeps failures growing for the next error', () => {
    const plan = planNext({ kind: 'error' }, c({ failures: 6 }), () => 1, 500)
    expect(plan).toMatchObject({ delayMs: 30_000, counters: { failures: 7 } })
  })

  it('resync honors the server retry and drops Last-Event-ID', () => {
    const plan = planNext({ kind: 'resync', retryMs: 17342 }, c(), half)
    expect(plan).toMatchObject({ action: 'reconnect', delayMs: 17342, resume: false })
  })

  it('resync without retry and gaps wait a 0–2 s jitter the first time', () => {
    expect(planNext({ kind: 'resync' }, c(), half)).toMatchObject({ delayMs: 1000, resume: false })
    expect(planNext({ kind: 'gap' }, c(), half)).toMatchObject({ delayMs: 1000, resume: false })
  })

  it('repeated resync/gap without progress escalates instead of hot-looping', () => {
    let counters = c()
    const delays: number[] = []
    for (let i = 0; i < 8; i++) {
      const plan = planNext({ kind: 'gap' }, counters, () => 1)
      if (plan.action !== 'reconnect') throw new Error('expected reconnect')
      delays.push(plan.delayMs)
      counters = plan.counters
    }
    expect(delays[0]).toBe(2000)
    expect(delays[3]).toBeGreaterThan(delays[1])
    expect(Math.max(...delays)).toBeLessThanOrEqual(30_000)
    expect(delays.at(-1)).toBe(30_000)
  })

  it('ticket-invalid → new ticket with backoff, keeps resuming', () => {
    const plan = planNext({ kind: 'ticket-invalid' }, c(), () => 1)
    expect(plan).toMatchObject({ action: 'reconnect', resume: true, counters: { failures: 1 } })
    if (plan.action !== 'reconnect') return
    expect(plan.delayMs).toBe(2000)
  })

  it('unavailable waits at least Retry-After plus backoff jitter', () => {
    const plan = planNext({ kind: 'unavailable', retryAfterMs: 5000 }, c(), zero)
    expect(plan).toMatchObject({ action: 'reconnect', delayMs: 5000, resume: true })
    const withJitter = planNext({ kind: 'unavailable', retryAfterMs: 5000 }, c({ failures: 2 }), () => 1)
    if (withJitter.action !== 'reconnect') throw new Error('expected reconnect')
    expect(withJitter.delayMs).toBeGreaterThan(5000)
  })

  it('rate-limited waits 30 s + jitter, doubling up to ~5 min', () => {
    const first = planNext({ kind: 'rate-limited' }, c(), zero)
    expect(first).toMatchObject({ delayMs: 30_000, counters: { rateLimited: 1 } })
    const late = planNext({ kind: 'rate-limited' }, c({ rateLimited: 10 }), () => 1)
    if (late.action !== 'reconnect') throw new Error('expected reconnect')
    expect(late.delayMs).toBe(300_000)
  })

  it('error → exponential full jitter, base 1 s, cap 30 s', () => {
    expect(planNext({ kind: 'error' }, c(), () => 1)).toMatchObject({ delayMs: 2000, resume: true })
    expect(planNext({ kind: 'error' }, c({ failures: 20 }), () => 1)).toMatchObject({ delayMs: 30_000 })
  })
})
