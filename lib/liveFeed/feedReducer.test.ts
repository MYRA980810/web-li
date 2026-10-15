import { describe, expect, it } from 'vitest'
import { applyFeedMessage, EMPTY_FEED, selectCards } from './feedReducer'
import type { FeedState, LiveFeedCard } from './types'

function card(id: string, over: Partial<LiveFeedCard> = {}): LiveFeedCard {
  return {
    id,
    sellerId: 's1',
    storeId: null,
    title: `Live ${id}`,
    sellerName: 'Tienda',
    thumbnailUrl: null,
    currentViewers: 0,
    startedAt: '2026-10-07T18:20:11.482913Z',
    categoryId: 'cat-a',
    ...over,
  }
}

function snapshot(version: number, cards: LiveFeedCard[], counts = [{ categoryId: 'cat-a', count: cards.length }]) {
  return { event: 'snapshot', data: JSON.stringify({ version, cards, counts }) }
}

function added(seq: number, c: LiveFeedCard, counts = [{ categoryId: 'cat-a', count: 1 }]) {
  return { event: 'live-added', data: JSON.stringify({ type: 'live-added', seq, card: c, counts }) }
}

function removed(seq: number, liveId: string, counts: unknown[] = []) {
  return { event: 'live-removed', data: JSON.stringify({ type: 'live-removed', seq, liveId, counts }) }
}

function stateAt(version: number, cards: LiveFeedCard[] = []): FeedState {
  return { version, cards: new Map(cards.map((c) => [c.id, c])), counts: [] }
}

describe('applyFeedMessage: snapshot', () => {
  it('replaces cards, counts and version', () => {
    const prev = stateAt(10, [card('old')])
    const res = applyFeedMessage(prev, snapshot(20, [card('a'), card('b')]))

    expect(res.kind).toBe('snapshot')
    if (res.kind !== 'snapshot') return
    expect(res.state.version).toBe(20)
    expect([...res.state.cards.keys()]).toEqual(['a', 'b'])
    expect(res.state.counts).toEqual([{ categoryId: 'cat-a', count: 2 }])
  })

  it('accepts a version-0 snapshot after a Redis flush (version regression is not an error)', () => {
    const res = applyFeedMessage(stateAt(1791331200457, [card('a')]), snapshot(0, [card('b')]))
    expect(res.kind).toBe('snapshot')
    if (res.kind !== 'snapshot') return
    expect(res.state.version).toBe(0)
    expect([...res.state.cards.keys()]).toEqual(['b'])
  })

  it('a malformed snapshot is a gap (reconnect for a fresh one)', () => {
    expect(applyFeedMessage(EMPTY_FEED, { event: 'snapshot', data: '{not json' }).kind).toBe('gap')
    expect(applyFeedMessage(EMPTY_FEED, { event: 'snapshot', data: '{"version":"x","cards":[]}' }).kind).toBe('gap')
  })
})

describe('applyFeedMessage: live-added / live-removed (§5.2)', () => {
  it('applies seq == version + 1 and advances the version', () => {
    const res = applyFeedMessage(stateAt(5), added(6, card('a')))
    expect(res).toMatchObject({ kind: 'added', liveId: 'a' })
    if (res.kind !== 'added') return
    expect(res.state.version).toBe(6)
    expect(res.state.cards.get('a')?.title).toBe('Live a')
    expect(res.state.counts).toEqual([{ categoryId: 'cat-a', count: 1 }])
  })

  it('discards duplicates (seq <= version) without touching state', () => {
    const prev = stateAt(6, [card('a')])
    expect(applyFeedMessage(prev, added(6, card('a', { title: 'x' }))).kind).toBe('ignored')
    expect(applyFeedMessage(prev, removed(3, 'a')).kind).toBe('ignored')
  })

  it('seq > version + 1 is a gap', () => {
    expect(applyFeedMessage(stateAt(5), added(7, card('a'))).kind).toBe('gap')
  })

  it('an event without a base version is a gap', () => {
    expect(applyFeedMessage(EMPTY_FEED, added(1, card('a'))).kind).toBe('gap')
  })

  it('applies seq 1 on top of a version-0 snapshot', () => {
    const res = applyFeedMessage(stateAt(0), added(1, card('a')))
    expect(res.kind).toBe('added')
  })

  it('live-added keeps the previous currentViewers (live-added always carries 0)', () => {
    const prev = stateAt(5, [card('a', { currentViewers: 37, categoryId: 'cat-a' })])
    const res = applyFeedMessage(prev, added(6, card('a', { currentViewers: 0, categoryId: 'cat-b' })))
    if (res.kind !== 'added') throw new Error(res.kind)
    expect(res.state.cards.get('a')).toMatchObject({ currentViewers: 37, categoryId: 'cat-b' })
  })

  it('live-removed deletes the card and replaces counts', () => {
    const res = applyFeedMessage(stateAt(5, [card('a'), card('b')]), removed(6, 'a', []))
    expect(res).toMatchObject({ kind: 'removed', liveId: 'a' })
    if (res.kind !== 'removed') return
    expect([...res.state.cards.keys()]).toEqual(['b'])
    expect(res.state.counts).toEqual([])
    expect(res.state.version).toBe(6)
  })

  it('does not mutate the previous state', () => {
    const prev = stateAt(5, [card('a')])
    applyFeedMessage(prev, removed(6, 'a'))
    expect(prev.cards.has('a')).toBe(true)
    expect(prev.version).toBe(5)
  })

  it('a malformed event is a gap', () => {
    expect(applyFeedMessage(stateAt(5), { event: 'live-added', data: '{"type":"live-added","seq":6}' }).kind).toBe('gap')
  })
})

describe('applyFeedMessage: resync and comments', () => {
  it('resync carries the retry field and never its seq', () => {
    const res = applyFeedMessage(stateAt(5), { event: 'resync', data: '{"type":"resync","seq":0}', retry: 17342 })
    expect(res).toEqual({ kind: 'resync', retryMs: 17342 })
  })

  it('resync without retry', () => {
    expect(applyFeedMessage(stateAt(5), { event: 'resync', data: '{"type":"resync","seq":99}' })).toEqual({
      kind: 'resync',
    })
  })

  it('comment-only blocks (:connected / :ping) and unknown events are ignored', () => {
    expect(applyFeedMessage(stateAt(5), { event: '', data: '' }).kind).toBe('ignored')
    expect(applyFeedMessage(stateAt(5), { event: 'future-thing', data: '{}' }).kind).toBe('ignored')
  })
})

describe('selectCards', () => {
  const feed = stateAt(1, [
    card('old', { startedAt: '2026-10-07T10:00:00Z', categoryId: 'cat-a' }),
    card('new', { startedAt: '2026-10-07T12:00:00.5Z', categoryId: 'cat-b' }),
    card('mid', { startedAt: '2026-10-07T11:00:00.123456Z', categoryId: null }),
  ])

  it('returns every card newest first', () => {
    expect(selectCards(feed).map((c) => c.id)).toEqual(['new', 'mid', 'old'])
  })

  it('filters by category on the client', () => {
    expect(selectCards(feed, 'cat-a').map((c) => c.id)).toEqual(['old'])
  })
})
