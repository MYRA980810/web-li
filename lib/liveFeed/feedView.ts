// Adapters from the SSE feed store to the explorer's existing view models.

import type { ActiveLiveCounts, PageResponse } from '@/lib/liveActions'
import { selectCards } from './feedReducer'
import type { FeedState, LiveFeedCard } from './types'

const STREAM_PATH = '/api/lives/feed/stream'

/** The stream is the full feed, so a category view is one complete, last page. */
export function feedToPage(feed: FeedState, categoryId: string | null): PageResponse<LiveFeedCard> {
  const content = selectCards(feed, categoryId)
  return {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    number: 0,
    size: content.length,
    first: true,
    last: true,
  }
}

/** "All" uses the card count: lives without a category are not in `counts` (§4.9). */
export function feedToCounts(feed: FeedState): ActiveLiveCounts {
  return {
    total: feed.cards.size,
    byCategory: Object.fromEntries(feed.counts.map((c) => [c.categoryId, c.count])),
  }
}

/** Stream URL when the SSE feed is enabled and configured; null → keep the Agora RTM feed. */
export function resolveFeedStreamUrl(flag: string | undefined, baseUrl: string | undefined): string | null {
  const base = baseUrl?.trim()
  if (flag !== 'true' || !base) return null
  return `${base.replace(/\/+$/, '')}${STREAM_PATH}`
}

/** Inlined at build time; must reference the literal env names. */
export const FEED_STREAM_URL = resolveFeedStreamUrl(
  process.env.NEXT_PUBLIC_LIVE_FEED_SSE,
  process.env.NEXT_PUBLIC_FEED_STREAM_URL,
)
