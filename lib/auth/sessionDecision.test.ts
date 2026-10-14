import { describe, expect, it } from 'vitest'
import {
  buildReturnPath,
  decideAfterRefresh,
  isRefreshDue,
  MAX_REFRESH_HOPS,
  parseHop,
  refreshStage,
  safeReturnPath,
} from './sessionDecision'

const ok = { kind: 'ok', accessToken: 'at-new', refreshToken: 'rt-new' } as const
const retry = { kind: 'retry' } as const
const invalid = { kind: 'invalid' } as const

const navigation = (hop = 0, expired = true) => ({ method: 'GET', isServerAction: false, hop, expired })
const serverAction = { method: 'POST', isServerAction: true, hop: 0, expired: true }

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
    expect(decideAfterRefresh(retry, { method: 'HEAD', isServerAction: false, hop: 0, expired: true })).toEqual({
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

describe('decideAfterRefresh (proactive window, token still valid)', () => {
  it('ok → forwards the refreshed tokens', () => {
    expect(decideAfterRefresh(ok, navigation(0, false))).toMatchObject({ type: 'refreshed', accessToken: 'at-new' })
  })

  it('retry → continues with the current token (navigation and action)', () => {
    expect(decideAfterRefresh(retry, navigation(0, false))).toEqual({ type: 'continue' })
    expect(decideAfterRefresh(retry, { ...serverAction, expired: false })).toEqual({ type: 'continue' })
  })

  it('retry never counts against the hop budget', () => {
    expect(decideAfterRefresh(retry, navigation(MAX_REFRESH_HOPS, false))).toEqual({ type: 'continue' })
  })

  it('invalid → logs out', () => {
    expect(decideAfterRefresh(invalid, navigation(0, false))).toEqual({ type: 'logout' })
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

function jwtWithExp(expSeconds: number | undefined): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', role: 'BUYER', exp: expSeconds })).toString('base64url')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

describe('refreshStage', () => {
  const now = 1_700_000_000_000

  it('fresh while more than 60s remain', () => {
    expect(refreshStage(jwtWithExp(now / 1000 + 61), now)).toBe('fresh')
  })

  it('proactive within 60s of exp', () => {
    expect(refreshStage(jwtWithExp(now / 1000 + 60), now)).toBe('proactive')
    expect(refreshStage(jwtWithExp(now / 1000 + 1), now)).toBe('proactive')
  })

  it('expired at or after exp', () => {
    expect(refreshStage(jwtWithExp(now / 1000), now)).toBe('expired')
    expect(refreshStage(jwtWithExp(now / 1000 - 30), now)).toBe('expired')
  })

  it('expired for an undecodable token', () => {
    expect(refreshStage('garbage', now)).toBe('expired')
  })
})

describe('isRefreshDue', () => {
  const now = 1_700_000_000_000

  it('is false while the token is valid', () => {
    expect(isRefreshDue(jwtWithExp(now / 1000 + 600), now)).toBe(false)
  })

  it('is true inside the proactive window', () => {
    expect(isRefreshDue(jwtWithExp(now / 1000 + 30), now)).toBe(true)
  })

  it('is true once the token is expired', () => {
    expect(isRefreshDue(jwtWithExp(now / 1000 - 1), now)).toBe(true)
  })

  it('is true for an undecodable token', () => {
    expect(isRefreshDue('garbage', now)).toBe(true)
    expect(isRefreshDue(jwtWithExp(undefined), now)).toBe(true)
  })
})

describe('buildReturnPath', () => {
  it('keeps pathname and search', () => {
    expect(buildReturnPath(new URL('https://x.test/buyer/lives?cat=a&page=2'))).toBe('/buyer/lives?cat=a&page=2')
  })

  it('drops the internal _rsc param', () => {
    expect(buildReturnPath(new URL('https://x.test/buyer/lives?_rsc=abc'))).toBe('/buyer/lives')
    expect(buildReturnPath(new URL('https://x.test/buyer?a=1&_rsc=abc'))).toBe('/buyer?a=1')
  })
})

describe('safeReturnPath', () => {
  it.each([
    ['/buyer/lives', '/buyer/lives'],
    ['/buyer?x=1', '/buyer?x=1'],
    [null, null],
    ['', null],
    ['https://evil.test/', null],
    ['//evil.test/', null],
    ['/\\evil.test/', null],
    ['buyer', null],
  ])('%s → %s', (raw, expected) => {
    expect(safeReturnPath(raw)).toBe(expected)
  })
})
