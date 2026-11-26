import { describe, expect, it } from 'vitest'
import { addChatBan, formatBannedAgo, parseChatBans, removeChatBan, userInitial, type ChatBan } from './chatBans'

const NOW = Date.parse('2026-11-24T12:00:00.000Z')
const ago = (ms: number) => new Date(NOW - ms).toISOString()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('formatBannedAgo', () => {
  it('says "hace un momento" under a minute', () => {
    expect(formatBannedAgo(ago(0), NOW)).toBe('hace un momento')
    expect(formatBannedAgo(ago(59_999), NOW)).toBe('hace un momento')
  })

  it('treats future timestamps (clock skew) as just now', () => {
    expect(formatBannedAgo(ago(-5 * MIN), NOW)).toBe('hace un momento')
  })

  it('uses whole minutes under an hour', () => {
    expect(formatBannedAgo(ago(MIN), NOW)).toBe('hace 1 min')
    expect(formatBannedAgo(ago(15 * MIN + 30_000), NOW)).toBe('hace 15 min')
    expect(formatBannedAgo(ago(59 * MIN), NOW)).toBe('hace 59 min')
  })

  it('uses whole hours under a day', () => {
    expect(formatBannedAgo(ago(HOUR), NOW)).toBe('hace 1 h')
    expect(formatBannedAgo(ago(2 * HOUR + 59 * MIN), NOW)).toBe('hace 2 h')
    expect(formatBannedAgo(ago(23 * HOUR), NOW)).toBe('hace 23 h')
  })

  it('uses whole days from a day on', () => {
    expect(formatBannedAgo(ago(DAY), NOW)).toBe('hace 1 d')
    expect(formatBannedAgo(ago(3 * DAY + 5 * HOUR), NOW)).toBe('hace 3 d')
  })

  it('returns null for unparseable dates', () => {
    expect(formatBannedAgo('not-a-date', NOW)).toBeNull()
    expect(formatBannedAgo('', NOW)).toBeNull()
  })
})

const ban = (userId: string, bannedAt = ago(0), displayName = userId): ChatBan => ({ userId, displayName, bannedAt })

describe('addChatBan', () => {
  it('prepends the new ban (newest first)', () => {
    const list = [ban('a'), ban('b')]
    expect(addChatBan(list, ban('c')).map((b) => b.userId)).toEqual(['c', 'a', 'b'])
  })

  it('replaces an existing ban of the same user instead of duplicating it', () => {
    const list = [ban('a'), ban('b', ago(HOUR), 'Old name')]
    const next = addChatBan(list, ban('b', ago(0), 'New name'))
    expect(next.map((b) => b.userId)).toEqual(['b', 'a'])
    expect(next[0].displayName).toBe('New name')
  })

  it('does not mutate the input', () => {
    const list = [ban('a')]
    addChatBan(list, ban('b'))
    expect(list).toHaveLength(1)
  })
})

describe('removeChatBan', () => {
  it('removes the user', () => {
    expect(removeChatBan([ban('a'), ban('b')], 'a').map((b) => b.userId)).toEqual(['b'])
  })

  it('returns the same list when the user is not banned', () => {
    const list = [ban('a')]
    expect(removeChatBan(list, 'zzz')).toBe(list)
  })
})

describe('parseChatBans', () => {
  it('keeps well-formed entries in order', () => {
    const raw = [
      { userId: 'u1', displayName: 'Laura', bannedAt: '2026-11-24T11:59:00Z' },
      { userId: 'u2', displayName: 'ofertas.ya', bannedAt: '2026-11-24T11:45:00Z', extra: true },
    ]
    expect(parseChatBans(raw)).toEqual([
      { userId: 'u1', displayName: 'Laura', bannedAt: '2026-11-24T11:59:00Z' },
      { userId: 'u2', displayName: 'ofertas.ya', bannedAt: '2026-11-24T11:45:00Z' },
    ])
  })

  it('drops entries without a userId and falls back on missing optional fields', () => {
    const raw = [
      { displayName: 'no id', bannedAt: '2026-11-24T11:59:00Z' },
      { userId: 'u3', displayName: '  ', bannedAt: null },
      null,
      'x',
    ]
    expect(parseChatBans(raw)).toEqual([{ userId: 'u3', displayName: 'Usuario', bannedAt: '' }])
  })

  it('returns an empty list for non-array bodies', () => {
    expect(parseChatBans(null)).toEqual([])
    expect(parseChatBans({ content: [] })).toEqual([])
  })
})

describe('userInitial', () => {
  it('returns the uppercased first letter', () => {
    expect(userInitial('laura')).toBe('L')
    expect(userInitial('  ofertas.ya')).toBe('O')
  })

  it('keeps surrogate pairs (emoji) whole and falls back to "?"', () => {
    expect(userInitial('😀 fan')).toBe('😀')
    expect(userInitial('')).toBe('?')
  })
})
