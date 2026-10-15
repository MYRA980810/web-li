// Reconnect loop and local store for the buyer lives feed stream (handoff
// §6, §7.2, §15). React-free: the hook only starts/stops it and forwards events.
// One instance per tab.

import { applyFeedMessage, EMPTY_FEED } from './feedReducer'
import { INITIAL_COUNTERS, planNext, ticketFailureOutcome, type RetryCounters } from './streamPolicy'
import type { FeedState, FeedStatus, SseMessage, StreamOutcome, StreamTicketResult } from './types'

export type OpenStreamParams = {
  ticket: string
  lastEventId?: string
  signal: AbortSignal
  onOpen: () => void
  onMessage: (msg: SseMessage) => StreamOutcome | null
}

export type OpenStream = (params: OpenStreamParams) => Promise<StreamOutcome>

export type LiveFeedClientDeps = {
  /**
   * Fetches a fresh single-use ticket. Called before every connection attempt.
   * `signal` aborts on stop()/pause(): it must cancel the request and any wait
   * for the cross-tab ticket lock.
   */
  getTicket: (signal: AbortSignal) => Promise<StreamTicketResult>
  openStream: OpenStream
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>
  random?: () => number
  /** Clock for connection lifetimes (ms). Defaults to Date.now. */
  now?: () => number
}

export type FeedEvent =
  | { type: 'snapshot'; feed: FeedState }
  | { type: 'added'; liveId: string; feed: FeedState }
  | { type: 'removed'; liveId: string; feed: FeedState }
  | { type: 'status'; status: FeedStatus }

export type FeedListener = (event: FeedEvent) => void

const TERMINAL: ReadonlySet<FeedStatus> = new Set(['forbidden', 'unauthenticated', 'stopped'])

export function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve()
    const done = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
    const timer = setTimeout(done, ms)
    signal.addEventListener('abort', done, { once: true })
  })
}

export class LiveFeedClient {
  private feed: FeedState = EMPTY_FEED
  private status: FeedStatus = 'idle'
  private listeners = new Set<FeedListener>()
  /** Current run (start/resume → stop/pause). */
  private run: AbortController | null = null
  /** Whether the next attempt may send Last-Event-ID. */
  private resumeNext = false
  private readonly sleep: (ms: number, signal: AbortSignal) => Promise<void>
  private readonly random: () => number
  private readonly now: () => number

  constructor(private readonly deps: LiveFeedClientDeps) {
    this.sleep = deps.sleep ?? abortableSleep
    this.random = deps.random ?? Math.random
    this.now = deps.now ?? Date.now
  }

  getFeed = (): FeedState => this.feed
  getStatus = (): FeedStatus => this.status

  subscribe = (listener: FeedListener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** First connection of the session: always asks for a snapshot. */
  start(): void {
    if (this.run || TERMINAL.has(this.status)) return
    this.resumeNext = false
    this.begin()
  }

  /** Hidden tab: frees the per-user stream slot, keeps the cards and version. */
  pause(): void {
    if (!this.run) return
    this.run.abort()
    this.run = null
    if (this.status === 'open' || this.status === 'connecting') {
      this.setStatus(this.feed.version === null ? 'connecting' : 'reconnecting')
    }
  }

  /** Visible again: reconnect, resuming from the local version when there is one. */
  resume(): void {
    if (this.run || this.status === 'idle' || TERMINAL.has(this.status)) return
    this.resumeNext = this.feed.version !== null
    this.begin()
  }

  /** Unmount / logout: drop the connection and every cached card. */
  stop(): void {
    this.run?.abort()
    this.run = null
    this.feed = EMPTY_FEED
    this.setStatus('stopped')
  }

  private begin(): void {
    const ctrl = new AbortController()
    this.run = ctrl
    void this.loop(ctrl.signal)
  }

  private setStatus(status: FeedStatus): void {
    if (status === this.status) return
    this.status = status
    this.emit({ type: 'status', status })
  }

  private emit(event: FeedEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  /** An abort surfaces as `retry`; the loop's own signal check turns it into a stop. */
  private async nextTicket(signal: AbortSignal): Promise<StreamTicketResult> {
    try {
      return await this.deps.getTicket(signal)
    } catch {
      return { ok: false, reason: 'retry' }
    }
  }

  private async loop(signal: AbortSignal): Promise<void> {
    let counters: RetryCounters = { ...INITIAL_COUNTERS }

    while (!signal.aborted) {
      this.setStatus(this.feed.version === null ? 'connecting' : 'reconnecting')

      const ticket = await this.nextTicket(signal)
      if (signal.aborted) return

      let outcome: StreamOutcome
      let openedAt: number | undefined
      if (!ticket.ok) {
        outcome = ticketFailureOutcome(ticket)
      } else {
        const lastEventId = this.resumeNext && this.feed.version !== null ? String(this.feed.version) : undefined
        try {
          outcome = await this.deps.openStream({
            ticket: ticket.ticket,
            lastEventId,
            signal,
            onOpen: () => {
              openedAt = this.now()
              // failures are only forgiven once the connection proves healthy
              // (see planNext), so a proxy closing right after open backs off.
              counters = { ...counters, rateLimited: 0 }
              // Resuming: the server omits the snapshot when we are up to date,
              // so the local base is trusted from here on (§10).
              if (lastEventId !== undefined) this.setStatus('open')
            },
            onMessage: (msg) => {
              const end = this.apply(msg)
              if (end === 'progress') {
                counters = { ...counters, resyncStreak: 0 }
                return null
              }
              return end
            },
          })
        } catch {
          outcome = { kind: 'error' }
        }
      }
      if (signal.aborted) return

      const connectionMs = openedAt === undefined ? undefined : this.now() - openedAt
      const plan = planNext(outcome, counters, this.random, connectionMs)
      if (plan.action === 'stop') {
        if (this.run?.signal === signal) this.run = null
        if (plan.status) this.setStatus(plan.status)
        return
      }
      counters = plan.counters
      this.resumeNext = plan.resume
      await this.sleep(plan.delayMs, signal)
    }
  }

  /** Applies one frame. `'progress'` = an in-order event was applied. */
  private apply(msg: SseMessage): StreamOutcome | 'progress' | null {
    const result = applyFeedMessage(this.feed, msg)
    switch (result.kind) {
      case 'ignored':
        return null
      case 'snapshot':
        this.feed = result.state
        this.setStatus('open')
        this.emit({ type: 'snapshot', feed: result.state })
        return null
      case 'added':
      case 'removed':
        this.feed = result.state
        this.setStatus('open')
        this.emit({ type: result.kind, liveId: result.liveId, feed: result.state })
        return 'progress'
      case 'resync':
        return result.retryMs !== undefined ? { kind: 'resync', retryMs: result.retryMs } : { kind: 'resync' }
      case 'gap':
        return { kind: 'gap' }
    }
  }
}
