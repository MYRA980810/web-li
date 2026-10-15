// Pure application of SSE frames to the local feed (handoff §4, §5.2).

import { z } from 'zod'
import type { FeedState, LiveFeedCard, SseMessage } from './types'

export const EMPTY_FEED: FeedState = { version: null, cards: new Map(), counts: [] }

const cardSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  storeId: z.string().nullable(),
  title: z.string(),
  sellerName: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  currentViewers: z.number(),
  startedAt: z.string(),
  categoryId: z.string().nullable(),
})

const countsSchema = z.array(z.object({ categoryId: z.string(), count: z.number() }))

const snapshotSchema = z.object({
  version: z.number(),
  cards: z.array(cardSchema),
  counts: countsSchema,
})

const addedSchema = z.object({ type: z.literal('live-added'), seq: z.number(), card: cardSchema, counts: countsSchema })
const removedSchema = z.object({
  type: z.literal('live-removed'),
  seq: z.number(),
  liveId: z.string(),
  counts: countsSchema,
})

export type ApplyResult =
  /** Comment block (:connected / :ping), unknown event or duplicate seq. */
  | { kind: 'ignored' }
  | { kind: 'snapshot'; state: FeedState }
  | { kind: 'added'; state: FeedState; liveId: string }
  | { kind: 'removed'; state: FeedState; liveId: string }
  /** Never carries the frame's seq: it must not be used as a version. */
  | { kind: 'resync'; retryMs?: number }
  /** Missed events, no base version, or an unparseable frame: reconnect for a snapshot. */
  | { kind: 'gap' }

function parse<T>(schema: z.ZodType<T>, data: string): T | null {
  try {
    const result = schema.safeParse(JSON.parse(data))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

/** Applies one SSE message. Never mutates `state`. */
export function applyFeedMessage(state: FeedState, msg: SseMessage): ApplyResult {
  switch (msg.event) {
    case 'snapshot': {
      const s = parse(snapshotSchema, msg.data)
      if (!s) return { kind: 'gap' }
      // Always a full replacement — including a version lower than ours (e.g.
      // version 0 right after a Redis flush, until the snapshot is rebuilt).
      return {
        kind: 'snapshot',
        state: { version: s.version, cards: new Map(s.cards.map((c) => [c.id, c])), counts: s.counts },
      }
    }
    case 'live-added':
    case 'live-removed': {
      const e = msg.event === 'live-added' ? parse(addedSchema, msg.data) : parse(removedSchema, msg.data)
      if (!e) return { kind: 'gap' }
      if (state.version === null) return { kind: 'gap' }
      if (e.seq <= state.version) return { kind: 'ignored' }
      if (e.seq !== state.version + 1) return { kind: 'gap' }

      const cards = new Map(state.cards)
      if (e.type === 'live-added') {
        const previous = cards.get(e.card.id)
        // live-added always carries currentViewers 0; keep the known value.
        cards.set(e.card.id, previous ? { ...e.card, currentViewers: previous.currentViewers } : e.card)
        return { kind: 'added', liveId: e.card.id, state: { version: e.seq, cards, counts: e.counts } }
      }
      cards.delete(e.liveId)
      return { kind: 'removed', liveId: e.liveId, state: { version: e.seq, cards, counts: e.counts } }
    }
    case 'resync':
      return msg.retry !== undefined ? { kind: 'resync', retryMs: msg.retry } : { kind: 'resync' }
    default:
      return { kind: 'ignored' }
  }
}

/** Newest first, optionally filtered by category (the stream is never filtered server-side). */
export function selectCards(state: FeedState, categoryId?: string | null): LiveFeedCard[] {
  const all = [...state.cards.values()]
  const filtered = categoryId ? all.filter((c) => c.categoryId === categoryId) : all
  return filtered.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
}
