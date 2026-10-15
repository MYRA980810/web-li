// Pure retry policy for the lives feed stream (handoff §6.2 and §15).
// Every reconnect fetches a new ticket; this module only decides how long to
// wait and whether the next attempt may resume with Last-Event-ID.

import type { FeedStatus, StreamOutcome, StreamTicketResult } from './types'

export const DEFAULT_RETRY_AFTER_MS = 5_000
/** Base wait for a transient session refresh on the ticket endpoint (§15.2: retry in ~500–1000 ms). */
const SESSION_RETRY_BASE_MS = 500
const ERROR_BASE_MS = 1_000
const ERROR_CAP_MS = 30_000
const RATE_LIMIT_BASE_MS = 30_000
const RATE_LIMIT_CAP_MS = 300_000
const CLOSE_JITTER_MS = 1_000
const RESYNC_JITTER_MS = 2_000
/**
 * A connection that lived at least this long proved healthy. A clean close
 * sooner than this (e.g. a proxy cutting streams right after open) is a
 * failure: otherwise every tab would fetch a ticket and reopen ~once a second.
 */
export const MIN_HEALTHY_CONNECTION_MS = 30_000

export type RetryCounters = {
  /**
   * Consecutive failed attempts (network, 5xx, ticket-invalid, unavailable,
   * short-lived close). Reset only once a connection proves healthy
   * (lived ≥ MIN_HEALTHY_CONNECTION_MS), not merely on open.
   */
  failures: number
  /** Consecutive 429s. Reset when a stream opens (a 429 rejects the open itself). */
  rateLimited: number
  /** Consecutive resync/gap closes without an applied event; bounds snapshot → gap loops. */
  resyncStreak: number
}

export const INITIAL_COUNTERS: RetryCounters = { failures: 0, rateLimited: 0, resyncStreak: 0 }

export type RetryPlan =
  | { action: 'reconnect'; delayMs: number; resume: boolean; counters: RetryCounters }
  /** `status` null = stopped by us (abort), keep the current status. */
  | { action: 'stop'; status: Extract<FeedStatus, 'forbidden' | 'unauthenticated'> | null }

/** Full jitter: random in [0, min(cap, base * 2^attempt)]. */
function fullJitter(attempt: number, baseMs: number, capMs: number, random: () => number): number {
  return random() * Math.min(capMs, baseMs * 2 ** attempt)
}

/** Retry-After as delta-seconds; missing or unreadable → 5 s (§15.3). */
export function parseRetryAfterMs(header: string | null | undefined): number {
  const value = header?.trim()
  if (!value || !/^\d+$/.test(value)) return DEFAULT_RETRY_AFTER_MS
  return Number(value) * 1000
}

/** Outcome for a stream response that is not a 200 event stream. */
export function classifyStreamOpen(status: number, code: string | undefined, retryAfter: string | null): StreamOutcome {
  // Every 401 goes back to the ticket endpoint, which performs the real session
  // check; TICKET_INVALID is the expected one (spent/expired ticket).
  if (status === 401) return { kind: 'ticket-invalid' }
  if (status === 403) return { kind: 'forbidden' }
  if (status === 429) return { kind: 'rate-limited' }
  if (status === 503) return { kind: 'unavailable', retryAfterMs: parseRetryAfterMs(retryAfter) }
  return { kind: 'error' }
}

export function ticketFailureOutcome(result: Exclude<StreamTicketResult, { ok: true }>): StreamOutcome {
  if (result.reason === 'forbidden') return { kind: 'forbidden' }
  if (result.reason === 'unauthenticated') return { kind: 'unauthenticated' }
  return { kind: 'unavailable', retryAfterMs: result.retryAfterMs ?? SESSION_RETRY_BASE_MS }
}

/**
 * @param connectionMs How long the stream stayed open (onOpen → end), or
 *   undefined when it never opened. Decides whether a clean close was healthy
 *   and whether failures accumulated before it are forgiven.
 */
export function planNext(
  outcome: StreamOutcome,
  current: RetryCounters,
  random: () => number,
  connectionMs?: number,
): RetryPlan {
  const healthy = connectionMs !== undefined && connectionMs >= MIN_HEALTHY_CONNECTION_MS
  const counters = healthy ? { ...current, failures: 0 } : current

  switch (outcome.kind) {
    case 'aborted':
      return { action: 'stop', status: null }
    case 'forbidden':
    case 'unauthenticated':
      return { action: 'stop', status: outcome.kind }

    case 'closed': {
      // Clean close either way: the local base is still trusted (resume).
      if (healthy) {
        // Normal server close (14 min lifetime).
        return {
          action: 'reconnect',
          delayMs: random() * CLOSE_JITTER_MS,
          resume: true,
          counters: { ...INITIAL_COUNTERS },
        }
      }
      // Closed too soon: back off like an error and keep every counter.
      const failures = counters.failures + 1
      return {
        action: 'reconnect',
        delayMs: fullJitter(failures, ERROR_BASE_MS, ERROR_CAP_MS, random),
        resume: true,
        counters: { ...counters, failures },
      }
    }

    case 'resync':
    case 'gap': {
      const streak = counters.resyncStreak
      const retryMs = outcome.kind === 'resync' ? outcome.retryMs : undefined
      // First one: server retry or a short jitter. Repeats without progress
      // (e.g. snapshot → gap during a rebuild) back off like errors.
      const backoff = streak === 0 ? random() * RESYNC_JITTER_MS : fullJitter(streak + 1, ERROR_BASE_MS, ERROR_CAP_MS, random)
      return {
        action: 'reconnect',
        delayMs: Math.max(retryMs ?? 0, backoff),
        resume: false,
        counters: { ...counters, resyncStreak: streak + 1 },
      }
    }

    case 'rate-limited': {
      const rateLimited = counters.rateLimited + 1
      const delayMs = Math.min(
        RATE_LIMIT_CAP_MS,
        RATE_LIMIT_BASE_MS + fullJitter(rateLimited, RATE_LIMIT_BASE_MS, RATE_LIMIT_CAP_MS, random),
      )
      return { action: 'reconnect', delayMs, resume: true, counters: { ...counters, rateLimited } }
    }

    case 'unavailable': {
      const failures = counters.failures + 1
      // At least Retry-After, plus the usual jitter so clients do not return together.
      const delayMs = outcome.retryAfterMs + fullJitter(failures - 1, ERROR_BASE_MS, ERROR_CAP_MS, random)
      return { action: 'reconnect', delayMs, resume: true, counters: { ...counters, failures } }
    }

    case 'ticket-invalid':
    case 'error': {
      const failures = counters.failures + 1
      return {
        action: 'reconnect',
        delayMs: fullJitter(failures, ERROR_BASE_MS, ERROR_CAP_MS, random),
        resume: true,
        counters: { ...counters, failures },
      }
    }
  }
}
