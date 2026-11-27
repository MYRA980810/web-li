import { describe, expect, it } from 'vitest'
import { parseIvsChatTokenBody } from './chatToken'

const USER = '11111111-1111-1111-1111-111111111111'
const body = {
  token: 'tok',
  sessionExpirationTime: '2030-01-01T00:00:00Z',
  tokenExpirationTime: '2030-01-01T00:00:00Z',
  region: 'us-east-1',
}

describe('parseIvsChatTokenBody', () => {
  it('keeps canSend=false (banned buyer: receive-only token)', () => {
    expect(parseIvsChatTokenBody({ ...body, canSend: false }, USER)).toEqual({ ...body, canSend: false, userId: USER })
  })

  it('keeps canSend=true', () => {
    expect(parseIvsChatTokenBody({ ...body, canSend: true }, USER)?.canSend).toBe(true)
  })

  it('defaults a missing or non-boolean canSend to true (older backend)', () => {
    expect(parseIvsChatTokenBody(body, USER)?.canSend).toBe(true)
    expect(parseIvsChatTokenBody({ ...body, canSend: null }, USER)?.canSend).toBe(true)
    expect(parseIvsChatTokenBody({ ...body, canSend: 'false' }, USER)?.canSend).toBe(true)
  })

  it('normalizes missing expirations to null', () => {
    const parsed = parseIvsChatTokenBody({ token: 'tok', region: 'us-east-1' }, USER)
    expect(parsed).toMatchObject({ sessionExpirationTime: null, tokenExpirationTime: null })
  })

  it('rejects a body without token or region', () => {
    expect(parseIvsChatTokenBody({ region: 'us-east-1' }, USER)).toBeNull()
    expect(parseIvsChatTokenBody({ token: 'tok' }, USER)).toBeNull()
    expect(parseIvsChatTokenBody(null, USER)).toBeNull()
  })
})
