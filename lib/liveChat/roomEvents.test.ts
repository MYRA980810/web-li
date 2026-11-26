import { describe, expect, it } from 'vitest'
import { isSelfUnbanEvent, parseAgoraSystemMessage, parseRoomEvent } from './roomEvents'

describe('parseRoomEvent (IVS string attributes)', () => {
  it('parses product-pinned with a plain decimal price string', () => {
    expect(
      parseRoomEvent('product-pinned', {
        liveProductId: 'lp-1',
        productName: 'Bolsa',
        price: '199.90',
        displayDurationSeconds: '30',
      }),
    ).toEqual({
      type: 'product-pinned',
      event: { liveProductId: 'lp-1', productName: 'Bolsa', price: 199.9, displayDurationSeconds: 30 },
    })
  })

  it('parses stock-update and viewer-count numbers from strings', () => {
    expect(parseRoomEvent('stock-update', { liveProductId: 'lp-1', stockRemaining: '4' })).toEqual({
      type: 'stock-update',
      event: { liveProductId: 'lp-1', stockRemaining: 4 },
    })
    expect(parseRoomEvent('viewer-count', { count: '1250' })).toEqual({ type: 'viewer-count', count: 1250 })
  })

  it('parses product-expired with a known status', () => {
    expect(parseRoomEvent('product-expired', { liveProductId: 'lp-1', status: 'SOLD' })).toEqual({
      type: 'product-expired',
      event: { liveProductId: 'lp-1', status: 'SOLD' },
    })
  })

  it('parses live-reconnecting and live-ended', () => {
    expect(parseRoomEvent('live-reconnecting', { liveId: 'l-1', reason: 'stream_disconnected' })).toEqual({
      type: 'live-reconnecting',
      event: { liveId: 'l-1', reason: 'stream_disconnected' },
    })
    expect(parseRoomEvent('live-ended', { liveId: 'l-1' })).toEqual({
      type: 'live-ended',
      event: { liveId: 'l-1' },
    })
  })

  it('rejects malformed numbers instead of producing NaN', () => {
    expect(parseRoomEvent('viewer-count', { count: 'abc' })).toBeNull()
    expect(parseRoomEvent('viewer-count', { count: '' })).toBeNull()
    expect(parseRoomEvent('stock-update', { liveProductId: 'lp-1' })).toBeNull()
    expect(parseRoomEvent('product-pinned', { liveProductId: 'lp-1', productName: 'x', price: '1,5', displayDurationSeconds: '3' })).toBeNull()
  })

  it('rejects unknown statuses, missing ids and unknown event names', () => {
    expect(parseRoomEvent('product-expired', { liveProductId: 'lp-1', status: 'GONE' })).toBeNull()
    expect(parseRoomEvent('live-ended', {})).toBeNull()
    expect(parseRoomEvent('something-else', { a: '1' })).toBeNull()
    expect(parseRoomEvent('viewer-count', undefined)).toBeNull()
  })

  it('still accepts native numbers (Agora JSON payloads)', () => {
    expect(parseRoomEvent('viewer-count', { count: 7 })).toEqual({ type: 'viewer-count', count: 7 })
  })
})

describe('parseAgoraSystemMessage', () => {
  it('ignores messages not sent by live-server', () => {
    expect(parseAgoraSystemMessage('{"type":"viewer-count","count":3}', 'user-1')).toEqual({ handled: false })
  })

  it('ignores non-JSON or untyped live-server messages', () => {
    expect(parseAgoraSystemMessage('hola', 'live-server')).toEqual({ handled: false })
    expect(parseAgoraSystemMessage('{"count":3}', 'live-server')).toEqual({ handled: false })
  })

  it('parses a typed live-server message', () => {
    expect(parseAgoraSystemMessage('{"type":"viewer-count","count":3}', 'live-server')).toEqual({
      handled: true,
      event: { type: 'viewer-count', count: 3 },
    })
  })

  it('swallows unknown live-server types without surfacing them as chat', () => {
    expect(parseAgoraSystemMessage('{"type":"future-thing"}', 'live-server')).toEqual({ handled: true, event: null })
  })
})

describe('chat-user-unbanned', () => {
  const SELF = '11111111-1111-1111-1111-111111111111'

  it('parses the unbanned user id', () => {
    expect(parseRoomEvent('chat-user-unbanned', { userId: SELF })).toEqual({ type: 'chat-user-unbanned', userId: SELF })
  })

  it('rejects a missing or empty userId', () => {
    expect(parseRoomEvent('chat-user-unbanned', {})).toBeNull()
    expect(parseRoomEvent('chat-user-unbanned', { userId: '' })).toBeNull()
  })

  it('matches only the current user', () => {
    const event = parseRoomEvent('chat-user-unbanned', { userId: SELF })
    expect(isSelfUnbanEvent(event, SELF)).toBe(true)
    expect(isSelfUnbanEvent(event, '33333333-3333-3333-3333-333333333333')).toBe(false)
    expect(isSelfUnbanEvent(event, '')).toBe(false)
    expect(isSelfUnbanEvent(parseRoomEvent('viewer-count', { count: '1' }), SELF)).toBe(false)
    expect(isSelfUnbanEvent(null, SELF)).toBe(false)
  })
})
