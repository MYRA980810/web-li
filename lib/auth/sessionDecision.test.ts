import { describe, expect, it } from 'vitest'
import { decideAfterRefresh, MAX_REFRESH_HOPS, parseHop } from './sessionDecision'

const ok = { kind: 'ok', accessToken: 'at-new', refreshToken: 'rt-new' } as const
const retry = { kind: 'retry' } as const
const invalid = { kind: 'invalid' } as const

const navigation = (hop = 0) => ({ method: 'GET', isServerAction: false, hop })
const serverAction = { method: 'POST', isServerAction: true, hop: 0 }

describe('decideAfterRefresh (expired token)', () => {
  it('ok → forwards the refreshed tokens', () => {
    expect(decideAfterRefresh(ok, navigation())).toEqual({
      type: 'refreshed',
      accessToken: 'at-new',
      refreshToken: 'rt-new',
    })
  })

  it('retry on a GET navigation with hop 0 → redirects with hop 1', () => {
    expect(decideAfterRefresh(retry, navigation(0))).toEqual({ type: 'retry-redirect', hop: 1 })
  })

  it('retry on a GET navigation with hop 1 → redirects with hop 2', () => {
    expect(decideAfterRefresh(retry, navigation(1))).toEqual({ type: 'retry-redirect', hop: 2 })
  })

  it(`retry on a GET navigation with hop ${MAX_REFRESH_HOPS} → logs out`, () => {
    expect(decideAfterRefresh(retry, navigation(MAX_REFRESH_HOPS))).toEqual({ type: 'logout' })
  })

  it('retry on a HEAD request behaves like a navigation', () => {
    expect(decideAfterRefresh(retry, { method: 'HEAD', isServerAction: false, hop: 0 })).toEqual({
      type: 'retry-redirect',
      hop: 1,
    })
  })

  it('retry on a server-action POST → passes through to the action', () => {
    expect(decideAfterRefresh(retry, serverAction)).toEqual({ type: 'continue' })
  })

  it('invalid → logs out (navigation and action alike)', () => {
    expect(decideAfterRefresh(invalid, navigation())).toEqual({ type: 'logout' })
    expect(decideAfterRefresh(invalid, serverAction)).toEqual({ type: 'logout' })
  })
})

describe('parseHop', () => {
  it.each([
    [undefined, 0],
    ['', 0],
    ['abc', 0],
    ['-3', 0],
    ['1', 1],
    ['2', 2],
  ])('%s → %i', (raw, expected) => {
    expect(parseHop(raw)).toBe(expected)
  })
})
