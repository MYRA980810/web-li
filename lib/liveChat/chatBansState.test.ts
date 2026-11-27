import { describe, expect, it } from 'vitest'
import type { ChatBan } from './chatBans'
import { chatBansReducer, initialChatBansState, type ChatBansState } from './chatBansState'

const ANA: ChatBan = { userId: 'u-ana', displayName: 'Ana', bannedAt: '2026-11-24T12:00:00.000Z' }
const BETO: ChatBan = { userId: 'u-beto', displayName: 'Beto', bannedAt: '2026-11-24T11:00:00.000Z' }
const CARLA: ChatBan = { userId: 'u-carla', displayName: 'Carla', bannedAt: '2026-11-24T10:00:00.000Z' }

function run(state: ChatBansState, ...actions: Parameters<typeof chatBansReducer>[1][]): ChatBansState {
  return actions.reduce(chatBansReducer, state)
}

describe('initialChatBansState', () => {
  it('starts loading when enabled and idle otherwise', () => {
    expect(initialChatBansState(true).status).toBe('loading')
    expect(initialChatBansState(false).status).toBe('idle')
    expect(initialChatBansState(true).bans).toEqual([])
  })
})

describe('chatBansReducer', () => {
  it('applies a successful fetch and becomes ready', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA, BETO] } },
    )
    expect(state).toMatchObject({ status: 'ready', error: null, bans: [ANA, BETO] })
  })

  it('reports a failed fetch and keeps the locally known bans', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'ban-recorded', ban: ANA },
      { type: 'fetch-start', requestId: 1 },
      { type: 'fetch-settled', requestId: 1, result: { ok: false, error: 'boom' } },
    )
    expect(state).toMatchObject({ status: 'error', error: 'boom', bans: [ANA] })
  })

  it('a refresh shows loading again and clears nothing until it settles', () => {
    const ready = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA] } },
    )
    const refreshing = chatBansReducer(ready, { type: 'fetch-start', requestId: 2 })
    expect(refreshing).toMatchObject({ status: 'loading', bans: [ANA] })
  })

  it('never stays loading when a ban is recorded while the fetch is in flight', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'ban-recorded', ban: CARLA },
      // The response was built before the ban: it must not drop Carla.
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA] } },
    )
    expect(state.status).toBe('ready')
    expect(state.error).toBeNull()
    expect(state.bans.map((b) => b.userId)).toEqual(['u-carla', 'u-ana'])
  })

  it('never stays loading when an unban happens while the fetch is in flight', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'unbanned', userId: 'u-ana' },
      // The response still lists Ana: the local unban wins.
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA, BETO] } },
    )
    expect(state.status).toBe('ready')
    expect(state.bans).toEqual([BETO])
  })

  it('replays the ban and the unban made during the fetch, in order', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'ban-recorded', ban: CARLA },
      { type: 'unbanned', userId: 'u-carla' },
      { type: 'ban-recorded', ban: BETO },
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA] } },
    )
    expect(state.bans.map((b) => b.userId)).toEqual(['u-beto', 'u-ana'])
  })

  it('ignores a stale response; the latest request settles the state', () => {
    const afterStale = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'fetch-start', requestId: 2 },
      { type: 'fetch-settled', requestId: 1, result: { ok: true, bans: [ANA] } },
    )
    expect(afterStale).toMatchObject({ status: 'loading', bans: [] })

    const settled = chatBansReducer(afterStale, {
      type: 'fetch-settled',
      requestId: 2,
      result: { ok: true, bans: [BETO] },
    })
    expect(settled).toMatchObject({ status: 'ready', bans: [BETO] })
  })

  it('a stale response arriving after the latest one changes nothing', () => {
    const state = run(
      initialChatBansState(true),
      { type: 'fetch-start', requestId: 1 },
      { type: 'fetch-start', requestId: 2 },
      { type: 'fetch-settled', requestId: 2, result: { ok: true, bans: [BETO] } },
      { type: 'fetch-settled', requestId: 1, result: { ok: false, error: 'late' } },
    )
    expect(state).toMatchObject({ status: 'ready', error: null, bans: [BETO] })
  })

  it('mutations outside a fetch apply directly', () => {
    const state = run(
      initialChatBansState(false),
      { type: 'ban-recorded', ban: ANA },
      { type: 'ban-recorded', ban: BETO },
      { type: 'unbanned', userId: 'u-ana' },
    )
    expect(state).toMatchObject({ status: 'idle', bans: [BETO] })
  })
})
