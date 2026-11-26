import { describe, expect, it } from 'vitest'
import { MAX_CHAT_RECONNECTS, reconnectDelayMs, toChatTokenDate } from './chatReconnect'

describe('reconnectDelayMs', () => {
  it('backs off exponentially from 2s and caps at 30s', () => {
    expect(reconnectDelayMs(0)).toBe(2000)
    expect(reconnectDelayMs(1)).toBe(4000)
    expect(reconnectDelayMs(3)).toBe(16000)
    expect(reconnectDelayMs(4)).toBe(30000)
  })

  it('gives up after the maximum number of attempts', () => {
    expect(reconnectDelayMs(MAX_CHAT_RECONNECTS - 1)).not.toBeNull()
    expect(reconnectDelayMs(MAX_CHAT_RECONNECTS)).toBeNull()
  })
})

describe('toChatTokenDate', () => {
  it('parses ISO strings into Dates', () => {
    expect(toChatTokenDate('2026-11-01T10:00:00Z')?.toISOString()).toBe('2026-11-01T10:00:00.000Z')
  })

  it('accepts epoch seconds and milliseconds', () => {
    expect(toChatTokenDate(1_700_000_000)?.getTime()).toBe(1_700_000_000_000)
    expect(toChatTokenDate(1_700_000_000_000)?.getTime()).toBe(1_700_000_000_000)
  })

  it('returns undefined for missing or invalid values', () => {
    expect(toChatTokenDate(null)).toBeUndefined()
    expect(toChatTokenDate('not a date')).toBeUndefined()
  })
})
