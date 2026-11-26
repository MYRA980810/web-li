import { describe, expect, it } from 'vitest'
import {
  appendChatMessage,
  chatMaxMessageLength,
  mapAgoraMessage,
  optimisticOwnMessage,
  truncateChatText,
  applyAgoraHistoryGap,
  mapHistoryMessages,
  mapIvsMessage,
  mergeChatMessages,
  removeChatMessage,
  type ChatMessage,
} from './chatMessages'
import type { ChatHistoryMessage } from '@/lib/liveActions'

const SELF = '11111111-1111-1111-1111-111111111111'
const SELLER = '22222222-2222-2222-2222-222222222222'
const OTHER = '33333333-3333-3333-3333-333333333333'

function history(id: string, sentAt: string, userId = OTHER, providerMessageId = `p-${id}`): ChatHistoryMessage {
  return { id, providerMessageId, userId, username: 'Ana', content: `msg ${id}`, sentAt }
}

function msg(id: string, sentAt: string, providerMessageId: string | null = null): ChatMessage {
  return {
    id,
    providerMessageId,
    userId: OTHER,
    username: 'Ana',
    content: id,
    sentAt,
    color: '#fff',
    isOwn: false,
    isHost: false,
  }
}

describe('mapHistoryMessages', () => {
  it('returns history oldest-first even though the backend sends newest-first', () => {
    const mapped = mapHistoryMessages(
      [history('b', '2026-11-01T10:00:02Z'), history('a', '2026-11-01T10:00:01Z')],
      { selfUserId: SELF },
    )
    expect(mapped.map((m) => m.id)).toEqual(['a', 'b'])
    expect(mapped[0].providerMessageId).toBe('p-a')
  })

  it('marks own and host messages', () => {
    const [own, host] = mapHistoryMessages(
      [history('a', '2026-11-01T10:00:01Z', SELF), history('b', '2026-11-01T10:00:02Z', SELLER)],
      { selfUserId: SELF, sellerId: SELLER },
    )
    expect(own.isOwn).toBe(true)
    expect(own.username).toBe('Tú')
    expect(host.isHost).toBe(true)
    expect(host.isOwn).toBe(false)
  })

  it('masks raw UUID usernames', () => {
    const [m] = mapHistoryMessages([{ ...history('a', '2026-11-01T10:00:01Z'), username: OTHER }], { selfUserId: SELF })
    expect(m.username).toBe('Usuario 33333333')
  })
})

describe('mapIvsMessage', () => {
  it('uses the displayName attribute and the role for the host badge', () => {
    const m = mapIvsMessage(
      {
        id: 'ivs-1',
        content: 'hola',
        sendTime: new Date('2026-11-01T10:00:00Z'),
        sender: { userId: SELLER, attributes: { displayName: 'Tienda Sol', role: 'SELLER', liveId: 'l' } },
      },
      SELF,
    )
    expect(m).toMatchObject({
      id: 'ivs-1',
      providerMessageId: 'ivs-1',
      userId: SELLER,
      username: 'Tienda Sol',
      content: 'hola',
      sentAt: '2026-11-01T10:00:00.000Z',
      isHost: true,
      isOwn: false,
    })
  })

  it('detects own messages by sender userId and falls back when displayName is missing', () => {
    expect(
      mapIvsMessage({ id: 'x', content: 'a', sendTime: new Date(0), sender: { userId: SELF } }, SELF),
    ).toMatchObject({ isOwn: true, username: 'Tú', isHost: false })
    expect(
      mapIvsMessage({ id: 'y', content: 'a', sendTime: new Date(0), sender: { userId: OTHER } }, SELF).username,
    ).toBe('Usuario')
  })
})

describe('mergeChatMessages', () => {
  it('dedupes realtime vs history on providerMessageId and keeps chronological order', () => {
    const realtime = msg('ivs-2', '2026-11-01T10:00:02Z', 'ivs-2')
    const fromHistory = [
      { ...msg('db-1', '2026-11-01T10:00:01Z', 'ivs-1') },
      { ...msg('db-2', '2026-11-01T10:00:02Z', 'ivs-2') },
    ]
    const merged = mergeChatMessages([realtime], fromHistory)
    expect(merged.map((m) => m.providerMessageId)).toEqual(['ivs-1', 'ivs-2'])
    expect(merged).toHaveLength(2)
  })

  it('returns the same array when nothing new arrives', () => {
    const prev = [msg('a', '2026-11-01T10:00:01Z', 'a')]
    expect(mergeChatMessages(prev, [msg('a', '2026-11-01T10:00:01Z', 'a')])).toBe(prev)
  })
})

describe('appendChatMessage', () => {
  it('never drops messages without a provider id, even with equal ids', () => {
    const a = msg('rtm-x-1', 't')
    const b = { ...msg('rtm-x-1', 't'), content: 'other' }
    expect(appendChatMessage(appendChatMessage([], a), b)).toHaveLength(2)
  })

  it('appends without reordering and ignores duplicates', () => {
    const prev = [msg('a', '2026-11-01T10:00:05Z', 'a')]
    const next = appendChatMessage(prev, msg('b', '2026-11-01T10:00:01Z', 'b'))
    expect(next.map((m) => m.id)).toEqual(['a', 'b'])
    expect(appendChatMessage(next, msg('b', '2026-11-01T10:00:01Z', 'b'))).toBe(next)
  })
})

describe('removeChatMessage', () => {
  it('removes by provider message id (history rows) or by id', () => {
    const prev = [msg('db-1', 't', 'ivs-1'), msg('ivs-2', 't', 'ivs-2'), msg('c', 't')]
    expect(removeChatMessage(prev, 'ivs-1').map((m) => m.id)).toEqual(['ivs-2', 'c'])
    expect(removeChatMessage(prev, 'c').map((m) => m.id)).toEqual(['db-1', 'ivs-2'])
    expect(removeChatMessage(prev, 'nope')).toBe(prev)
  })
})

describe('applyAgoraHistoryGap', () => {
  it('replaces with history and keeps own optimistic messages the server has not stored yet', () => {
    const prev = [msg('h1', 't1'), { ...msg('own-1', 't2'), content: 'pending' }, { ...msg('own-2', 't3'), content: 'msg h2' }]
    const incoming = [msg('h1', 't1'), { ...msg('h2', 't3'), content: 'msg h2' }]
    expect(applyAgoraHistoryGap(prev, incoming).map((m) => m.id)).toEqual(['h1', 'h2', 'own-1'])
  })

  it('keeps state when history brings nothing new', () => {
    const prev = [msg('h1', 't1')]
    expect(applyAgoraHistoryGap(prev, [msg('h1', 't1')])).toBe(prev)
  })
})

describe('local message ids', () => {
  it('are unique even within the same millisecond', () => {
    const ids = new Set([
      mapAgoraMessage('a', 'm', SELF).id,
      mapAgoraMessage('b', 'm', SELF).id,
      optimisticOwnMessage('c', SELF).id,
      optimisticOwnMessage('d', SELF).id,
    ])
    expect(ids.size).toBe(4)
    expect(optimisticOwnMessage('e', SELF).id.startsWith('own-')).toBe(true)
  })
})

describe('chat length limits', () => {
  it('is 500 for IVS and 300 for Agora', () => {
    expect(chatMaxMessageLength('ivs')).toBe(500)
    expect(chatMaxMessageLength('agora')).toBe(300)
  })

  it('truncates by code points without splitting emoji', () => {
    expect(truncateChatText('  hola  ', 10)).toBe('hola')
    expect(truncateChatText('ab😀cd', 3)).toBe('ab😀')
    expect(truncateChatText('😀😀😀', 2)).toBe('😀😀')
  })
})
