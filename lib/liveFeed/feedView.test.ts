import { describe, expect, it } from 'vitest'
import { feedToCounts, feedToPage, resolveFeedStreamUrl } from './feedView'
import type { FeedState, LiveFeedCard } from './types'

function card(id: string, categoryId: string | null, startedAt: string): LiveFeedCard {
  return {
    id,
    sellerId: 's',
    storeId: null,
    title: id,
    sellerName: null,
    thumbnailUrl: null,
    currentViewers: 0,
    startedAt,
    categoryId,
  }
}

const feed: FeedState = {
  version: 3,
  cards: new Map([
    ['a', card('a', 'cat-1', '2026-10-07T10:00:00Z')],
    ['b', card('b', null, '2026-10-07T12:00:00Z')],
    ['c', card('c', 'cat-1', '2026-10-07T11:00:00Z')],
  ]),
  counts: [{ categoryId: 'cat-1', count: 2 }],
}

describe('feedToPage', () => {
  it('whole feed for the "all" chip, newest first, as a single last page', () => {
    const page = feedToPage(feed, null)
    expect(page.content.map((c) => c.id)).toEqual(['b', 'c', 'a'])
    expect(page).toMatchObject({ totalElements: 3, number: 0, first: true, last: true, totalPages: 1 })
  })

  it('filters by category on the client', () => {
    const page = feedToPage(feed, 'cat-1')
    expect(page.content.map((c) => c.id)).toEqual(['c', 'a'])
    expect(page.totalElements).toBe(2)
  })

  it('empty feed → zero pages', () => {
    const page = feedToPage({ version: 1, cards: new Map(), counts: [] }, null)
    expect(page).toMatchObject({ content: [], totalElements: 0, totalPages: 0, last: true })
  })
})

describe('feedToCounts', () => {
  it('"all" total is the card count (uncategorized lives included), not the sum of counts', () => {
    expect(feedToCounts(feed)).toEqual({ total: 3, byCategory: { 'cat-1': 2 } })
  })
})

describe('resolveFeedStreamUrl', () => {
  it('enabled only when the flag is "true" and a base URL is set', () => {
    expect(resolveFeedStreamUrl('true', 'https://api.test')).toBe('https://api.test/api/lives/feed/stream')
    expect(resolveFeedStreamUrl('true', 'https://api.test/')).toBe('https://api.test/api/lives/feed/stream')
    expect(resolveFeedStreamUrl('false', 'https://api.test')).toBeNull()
    expect(resolveFeedStreamUrl(undefined, 'https://api.test')).toBeNull()
    expect(resolveFeedStreamUrl('true', undefined)).toBeNull()
    expect(resolveFeedStreamUrl('true', '  ')).toBeNull()
  })
})
