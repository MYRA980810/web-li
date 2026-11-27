import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatRoomConfig, ChatToken } from 'amazon-ivs-chat-messaging'
import type { GetIvsChatTokenResult } from '@/lib/liveActions'
import { createIvsChatTransport, type IvsChatTransportDeps, type IvsSdk } from './ivsChatTransport'
import type { ChatTransportHandlers } from './chatTransport'
import { MAX_CHAT_RECONNECTS } from './chatReconnect'

const SELF = '11111111-1111-1111-1111-111111111111'
const OTHER = '33333333-3333-3333-3333-333333333333'

type Listener = (...args: unknown[]) => void

class FakeChatRoom {
  static instances: FakeChatRoom[] = []
  state: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  logLevel = 'debug'
  connectCalls = 0
  readonly listeners = new Map<string, Set<Listener>>()
  readonly sent: string[] = []

  constructor(readonly config: ChatRoomConfig) {
    FakeChatRoom.instances.push(this)
  }

  addListener(name: string, listener: Listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set())
    this.listeners.get(name)!.add(listener)
    return () => this.listeners.get(name)?.delete(listener)
  }

  emit(name: string, ...args: unknown[]) {
    this.listeners.get(name)?.forEach((l) => l(...args))
  }

  connect() {
    this.connectCalls += 1
    this.state = 'connecting'
    this.emit('connecting')
  }

  disconnect() {
    this.state = 'disconnected'
    this.emit('disconnect', 'clientDisconnect')
  }

  /** Simulates the SDK asking for a token and opening the socket. */
  async open(): Promise<ChatToken> {
    const token = await this.config.tokenProvider()
    this.state = 'connected'
    this.emit('connect')
    return token
  }

  /** Simulates the SDK giving up (retries exhausted / server close). */
  drop(reason = 'socketError') {
    this.state = 'disconnected'
    this.emit('disconnect', reason)
  }

  /** Override to control when a send settles. */
  sendImpl: () => Promise<unknown> = () => Promise.resolve()

  sendMessage(request: { content: string }) {
    this.sent.push(request.content)
    return this.sendImpl()
  }
}

class FakeSendMessageRequest {
  constructor(readonly content: string) {}
}

const sdk = { ChatRoom: FakeChatRoom, SendMessageRequest: FakeSendMessageRequest } as unknown as IvsSdk

function okToken(n: number, canSend = true): GetIvsChatTokenResult {
  return {
    ok: true,
    data: {
      token: `tok-${n}`,
      sessionExpirationTime: '2030-01-01T00:00:00Z',
      tokenExpirationTime: '2030-01-01T00:00:00Z',
      region: 'us-east-1',
      canSend,
      userId: SELF,
    },
  }
}

function fail(status: number, code: string | null): GetIvsChatTokenResult {
  return { ok: false, status, code, error: 'x' }
}

function makeHandlers() {
  return {
    onIdentity: vi.fn(),
    loadHistory: vi.fn(() => Promise.resolve()),
    onMessage: vi.fn(),
    onRoomEvent: vi.fn(),
    onMessageDeleted: vi.fn(),
    onConnectionChange: vi.fn(),
    onSendPermission: vi.fn(),
    onGaveUp: vi.fn(),
  } satisfies ChatTransportHandlers
}

function setup(tokens: GetIvsChatTokenResult[], overrides: Partial<IvsChatTransportDeps> = {}) {
  let n = 0
  const requestToken = vi.fn(async () => tokens[Math.min(n++, tokens.length - 1)])
  let resume: (() => void) | null = null
  const unsubscribeResume = vi.fn()
  const deps: IvsChatTransportDeps = {
    requestToken,
    loadSdk: async () => sdk,
    subscribeResume: (cb) => {
      resume = cb
      return unsubscribeResume
    },
    tokenRetryDelayMs: 0,
    ...overrides,
  }
  const handlers = makeHandlers()
  const transport = createIvsChatTransport('live-1', handlers, deps)
  return { transport, handlers, requestToken, resume: () => resume?.(), unsubscribeResume }
}

/** Lets pending promise chains (token fetch, sdk import) settle. */
async function flush() {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

async function connected(tokens: GetIvsChatTokenResult[]) {
  const ctx = setup(tokens)
  ctx.transport.connect()
  await flush()
  const room = FakeChatRoom.instances.at(-1)!
  await room.open()
  return { ...ctx, room }
}

beforeEach(() => {
  FakeChatRoom.instances = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createIvsChatTransport', () => {
  it('connects the room without waiting for history and loads history concurrently', async () => {
    const ctx = setup([okToken(1)])
    ctx.handlers.loadHistory.mockImplementation(() => new Promise(() => {})) // never resolves
    ctx.transport.connect()
    await flush()
    const room = FakeChatRoom.instances[0]
    expect(room.connectCalls).toBe(1)
    expect(ctx.handlers.loadHistory).toHaveBeenCalledWith('initial')
    expect(room.config.regionOrUrl).toBe('us-east-1')
    expect(ctx.handlers.onIdentity).toHaveBeenCalledWith(SELF)
  })

  it('uses the prefetched token once, then fetches a fresh token per reconnect', async () => {
    const { room, requestToken } = await connected([okToken(1), okToken(2), okToken(3)])
    expect(requestToken).toHaveBeenCalledTimes(1)
    const second = await room.config.tokenProvider()
    const third = await room.config.tokenProvider()
    expect(second.token).toBe('tok-2')
    expect(third.token).toBe('tok-3')
    expect(requestToken).toHaveBeenCalledTimes(3)
  })

  it('stops on a terminal token error without reconnecting or calling the backend again', async () => {
    const { room, requestToken } = await connected([okToken(1), fail(403, 'LIVE_NOT_ACTIVE')])
    await expect(room.config.tokenProvider()).rejects.toThrow()
    await expect(room.config.tokenProvider()).rejects.toThrow()
    expect(requestToken).toHaveBeenCalledTimes(2)
    room.drop('fetchTokenError')
    await vi.runAllTimersAsync()
    expect(room.connectCalls).toBe(1)
  })

  it('applies canSend from the initial token and from every fresh token', async () => {
    const { room, handlers } = await connected([okToken(1, false), okToken(2, true), okToken(3, false)])
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(false)
    await room.config.tokenProvider()
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(true)
    await room.config.tokenProvider()
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(false)
  })

  it('retries a 503 with backoff after the SDK gives up', async () => {
    const { room, requestToken } = await connected([okToken(1), fail(503, 'CHAT_PROVIDER_UNAVAILABLE'), okToken(2)])
    await expect(room.config.tokenProvider()).rejects.toThrow()
    room.drop('fetchTokenError')
    expect(room.connectCalls).toBe(1)
    await vi.advanceTimersByTimeAsync(2000)
    expect(room.connectCalls).toBe(2)
    expect((await room.config.tokenProvider()).token).toBe('tok-2')
    expect(requestToken).toHaveBeenCalledTimes(3)
  })

  it('retries the initial token fetch on 503 and stops on a terminal one', async () => {
    const retry = setup([fail(503, null), okToken(1)])
    retry.transport.connect()
    await flush()
    expect(FakeChatRoom.instances).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(2000)
    await flush()
    expect(FakeChatRoom.instances).toHaveLength(1)

    FakeChatRoom.instances = []
    const stop = setup([fail(404, 'LIVE_NOT_FOUND')])
    stop.transport.connect()
    await vi.runAllTimersAsync()
    expect(FakeChatRoom.instances).toHaveLength(0)
    expect(stop.requestToken).toHaveBeenCalledTimes(1)
  })

  it('stops and disconnects on live-ended, never reconnecting', async () => {
    const { room, handlers } = await connected([okToken(1)])
    room.emit('event', { id: 'e', eventName: 'live-ended', sendTime: new Date(), attributes: { liveId: 'live-1' } })
    expect(handlers.onRoomEvent).toHaveBeenCalledWith({ type: 'live-ended', event: { liveId: 'live-1' } })
    expect(room.state).toBe('disconnected')
    room.drop('serverDisconnect')
    await vi.runAllTimersAsync()
    expect(room.connectCalls).toBe(1)
  })

  it('on its own userDisconnect (ban) reconnects at once with a fresh read-only token, not a stop', async () => {
    const { room, handlers, requestToken } = await connected([okToken(1), okToken(2, false)])
    room.emit('userDisconnect', { id: 'e', userId: OTHER, sendTime: new Date() })
    expect(room.connectCalls).toBe(1)

    room.emit('userDisconnect', { id: 'e', userId: SELF, sendTime: new Date() })
    expect(room.connectCalls).toBe(2)
    const token = await room.open()
    expect(token.token).toBe('tok-2')
    expect(requestToken).toHaveBeenCalledTimes(2)
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(false)
    expect(handlers.onGaveUp).not.toHaveBeenCalled()
    expect(handlers.onConnectionChange).toHaveBeenLastCalledWith(true)
    expect(handlers.loadHistory).toHaveBeenCalledWith('gap')
  })

  it('a server disconnect without the userDisconnect event still reconnects with a fresh token', async () => {
    const { room, handlers } = await connected([okToken(1), okToken(2, false)])
    room.drop('serverDisconnect')
    await vi.advanceTimersByTimeAsync(2000)
    expect(room.connectCalls).toBe(2)
    await room.open()
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(false)
    expect(handlers.onGaveUp).not.toHaveBeenCalled()
  })

  it('on its own chat-user-unbanned event reconnects with a fresh token; never forwards the event', async () => {
    const { room, handlers } = await connected([okToken(1, false), okToken(2, true)])
    room.emit('event', { id: 'e', eventName: 'chat-user-unbanned', sendTime: new Date(), attributes: { userId: OTHER } })
    expect(room.connectCalls).toBe(1)

    room.emit('event', { id: 'e', eventName: 'chat-user-unbanned', sendTime: new Date(), attributes: { userId: SELF } })
    expect(room.connectCalls).toBe(2)
    await room.open()
    expect(handlers.onSendPermission).toHaveBeenLastCalledWith(true)
    expect(handlers.onRoomEvent).not.toHaveBeenCalled()
    expect(handlers.onMessage).not.toHaveBeenCalled()
  })

  it('forwards message deletions and maps realtime messages', async () => {
    const { room, handlers } = await connected([okToken(1)])
    room.emit('messageDelete', { id: 'e', messageId: 'ivs-9', sendTime: new Date() })
    expect(handlers.onMessageDeleted).toHaveBeenCalledWith('ivs-9')
    room.emit('message', {
      id: 'ivs-1',
      content: 'hola',
      sendTime: new Date(0),
      sender: { userId: SELF, attributes: { displayName: 'Yo', role: 'BUYER' } },
    })
    expect(handlers.onMessage).toHaveBeenCalledWith(expect.objectContaining({ providerMessageId: 'ivs-1', isOwn: true }))
  })

  it('fills the history gap only on reconnects', async () => {
    const { room, handlers } = await connected([okToken(1), okToken(2)])
    expect(handlers.loadHistory).not.toHaveBeenCalledWith('gap')
    room.drop('socketError')
    await vi.advanceTimersByTimeAsync(2000)
    await room.open()
    expect(handlers.loadHistory).toHaveBeenCalledWith('gap')
  })

  it('gives up after the max reconnects and re-arms on resume (online / visible)', async () => {
    const ctx = await connected([okToken(1), fail(503, null)])
    const { room } = ctx
    for (let i = 0; i < MAX_CHAT_RECONNECTS; i++) {
      room.drop('socketError')
      await vi.runAllTimersAsync()
    }
    const callsBefore = room.connectCalls
    room.drop('socketError')
    await vi.runAllTimersAsync()
    expect(room.connectCalls).toBe(callsBefore)
    expect(ctx.handlers.onGaveUp).toHaveBeenCalled()

    ctx.resume()
    expect(room.connectCalls).toBe(callsBefore + 1)
  })

  it('re-arms after a non-terminal fatal stop but not after a terminal one', async () => {
    const fatal = await connected([okToken(1), fail(500, null), okToken(2)])
    await expect(fatal.room.config.tokenProvider()).rejects.toThrow()
    fatal.room.drop('fetchTokenError')
    fatal.resume()
    expect(fatal.room.connectCalls).toBe(2)
    expect((await fatal.room.config.tokenProvider()).token).toBe('tok-2')

    FakeChatRoom.instances = []
    const ended = await connected([okToken(1)])
    ended.room.emit('event', { id: 'e', eventName: 'live-ended', sendTime: new Date(), attributes: { liveId: 'l' } })
    ended.resume()
    expect(ended.room.connectCalls).toBe(1)
  })

  it('does not reconnect on resume while already connected', async () => {
    const { room, resume } = await connected([okToken(1)])
    resume()
    expect(room.connectCalls).toBe(1)
  })

  it('removes the resume listeners and room listeners on dispose', async () => {
    const { room, transport, unsubscribeResume, handlers } = await connected([okToken(1)])
    transport.disconnect()
    expect(unsubscribeResume).toHaveBeenCalledTimes(1)
    room.emit('message', { id: 'x', content: 'a', sendTime: new Date(0), sender: { userId: OTHER } })
    expect(handlers.onMessage).not.toHaveBeenCalled()
  })

  it('sends through the room without an optimistic message', async () => {
    const { room, transport, handlers } = await connected([okToken(1)])
    await expect(transport.send('hola')).resolves.toBe('sent')
    expect(room.sent).toEqual(['hola'])
    expect(handlers.onMessage).not.toHaveBeenCalled()
  })

  it('reports a slow send as pending, and a late rejection never surfaces', async () => {
    const { room, transport } = await connected([okToken(1)])
    let rejectLate: (err: unknown) => void = () => {}
    room.sendImpl = () => new Promise((_, reject) => { rejectLate = reject })
    const outcome = transport.send('hola')
    await vi.advanceTimersByTimeAsync(10000)
    await expect(outcome).resolves.toBe('pending')
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    rejectLate({ id: 'e', errorCode: 406, errorMessage: 'late' })
    await flush()
    await vi.advanceTimersByTimeAsync(0)
    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('keeps rejecting review denials with the ChatError', async () => {
    const { room, transport } = await connected([okToken(1)])
    room.sendImpl = () => Promise.reject({ id: 'e', errorCode: 406, errorMessage: 'denied' })
    await expect(transport.send('hola')).rejects.toMatchObject({ errorCode: 406 })
  })

  it('a fatal stop reports gave-up, leaves the room disconnected and re-arms on resume', async () => {
    const ctx = await connected([okToken(1), fail(500, null), okToken(2)])
    const { room } = ctx
    room.drop('socketConnectionBroken') // SDK-internal reconnect path: room stays "connecting"
    room.state = 'connecting'
    await expect(room.config.tokenProvider()).rejects.toThrow()
    expect(ctx.handlers.onGaveUp).toHaveBeenCalledTimes(1)
    expect(room.state).toBe('disconnected')
    const calls = room.connectCalls
    ctx.resume()
    expect(room.connectCalls).toBe(calls + 1)
    expect((await room.config.tokenProvider()).token).toBe('tok-2')
  })

  it('reports a failed SDK import as a resumable stop, logs it, and retries on resume', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const importError = new Error('ChunkLoadError')
    const loadSdk = vi.fn<() => Promise<IvsSdk>>()
      .mockRejectedValueOnce(importError)
      .mockResolvedValue(sdk)
    const ctx = setup([okToken(1), okToken(2)], { loadSdk })

    ctx.transport.connect()
    await flush()

    expect(FakeChatRoom.instances).toHaveLength(0)
    expect(ctx.handlers.onConnectionChange).toHaveBeenLastCalledWith(false)
    expect(ctx.handlers.onGaveUp).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('[live-chat]'), importError)

    ctx.resume()
    await flush()
    expect(loadSdk).toHaveBeenCalledTimes(2)
    expect(FakeChatRoom.instances).toHaveLength(1)
    error.mockRestore()
  })

  it('a terminal stop does not report gave-up', async () => {
    const { room, handlers } = await connected([okToken(1), fail(403, 'LIVE_NOT_ACTIVE')])
    await expect(room.config.tokenProvider()).rejects.toThrow()
    expect(handlers.onGaveUp).not.toHaveBeenCalled()
  })
})
