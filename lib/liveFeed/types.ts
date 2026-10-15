// Contract types for the buyer lives feed SSE stream
// (handoff-frontend-feed-lives-sse.md §4, §5, §15).

import type { LiveFeedCardResponse } from '@/lib/liveActions'

/** Same shape as each `content` item of GET /api/lives/active. */
export type LiveFeedCard = LiveFeedCardResponse

export type CategoryCount = {
  categoryId: string
  count: number
}

export type FeedState = {
  /** Last applied version; null = no trusted base (a snapshot is required). */
  version: number | null
  cards: ReadonlyMap<string, LiveFeedCard>
  /** Replaced whole on every snapshot/event, never summed. */
  counts: readonly CategoryCount[]
}

/** One parsed SSE block, as delivered by fetch-event-source. */
export type SseMessage = {
  event: string
  data: string
  retry?: number
}

/** Result of POST /api/lives/feed/ticket (the Next route handler). */
export type StreamTicketResult =
  | { ok: true; ticket: string }
  | { ok: false; reason: 'retry'; retryAfterMs?: number }
  | { ok: false; reason: 'unauthenticated' }
  | { ok: false; reason: 'forbidden' }

/** Why one connection attempt (ticket + stream) ended. */
export type StreamOutcome =
  /** Server ended the stream cleanly (14 min lifetime). */
  | { kind: 'closed' }
  /** `resync` frame; the server closes right after. */
  | { kind: 'resync'; retryMs?: number }
  /** seq > version + 1, an event without a base, or an unparseable frame. */
  | { kind: 'gap' }
  /** 401 on the stream: ticket unknown, expired or already used. */
  | { kind: 'ticket-invalid' }
  /** 429: over the per-user stream limit on that replica. */
  | { kind: 'rate-limited' }
  /** 503 TICKET_STORE_UNAVAILABLE, or a transient ticket failure (session refresh retry). */
  | { kind: 'unavailable'; retryAfterMs: number }
  /** Not a BUYER. Terminal. */
  | { kind: 'forbidden' }
  /** Session is gone. Terminal. */
  | { kind: 'unauthenticated' }
  /** Network error, 5xx, unexpected response, watchdog. */
  | { kind: 'error' }
  /** Aborted by us (unmount, hidden tab, stop). */
  | { kind: 'aborted' }

export type FeedStatus =
  | 'idle'
  | 'connecting'
  /** Connected and synchronized. */
  | 'open'
  /** Showing the last known data while reconnecting. */
  | 'reconnecting'
  | 'unauthenticated'
  | 'forbidden'
  | 'stopped'
