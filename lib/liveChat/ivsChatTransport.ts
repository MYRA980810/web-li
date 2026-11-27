import type { ChatRoom, ChatToken } from 'amazon-ivs-chat-messaging'
import type { GetIvsChatTokenResult, IvsChatTokenData } from '@/lib/liveActions'
import { mapIvsMessage } from './chatMessages'
import { CHAT_NETWORK_ERROR, classifyChatTokenError, isTerminalChatStop, type ChatStopKind } from './chatErrors'
import { TOKEN_RETRY_DELAY_MS, reconnectDelayMs, toChatTokenDate } from './chatReconnect'
import { isSelfUnbanEvent, parseRoomEvent } from './roomEvents'
import type { ChatTransport, ChatTransportHandlers, SendOutcome } from './chatTransport'

/** Retries the SDK makes on its own (back-to-back) before reporting `disconnect`. */
const SDK_MAX_RECONNECT_ATTEMPTS = 2
/** sendMessage only settles when the server answers; never leave the UI stuck. */
const SEND_TIMEOUT_MS = 10000

export type IvsSdk = Pick<typeof import('amazon-ivs-chat-messaging'), 'ChatRoom' | 'SendMessageRequest'>

export type IvsChatTransportDeps = {
  /** The getIvsChatToken server action (injected so the transport stays testable). */
  requestToken: (liveId: string) => Promise<GetIvsChatTokenResult>
  loadSdk?: () => Promise<IvsSdk>
  /** Calls `onResume` when the device comes back online or the tab becomes visible. */
  subscribeResume?: (onResume: () => void) => () => void
  tokenRetryDelayMs?: number
}

const loadIvsSdk = (): Promise<IvsSdk> => import('amazon-ivs-chat-messaging')

function subscribeBrowserResume(onResume: () => void): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}
  const onVisibility = () => {
    if (document.visibilityState === 'visible') onResume()
  }
  window.addEventListener('online', onResume)
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    window.removeEventListener('online', onResume)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

function toChatToken(data: IvsChatTokenData): ChatToken {
  return {
    token: data.token,
    sessionExpirationTime: toChatTokenDate(data.sessionExpirationTime),
    tokenExpirationTime: toChatTokenDate(data.tokenExpirationTime),
  }
}

function delay(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()
}

/**
 * Settles with 'sent' or the send's rejection, or with 'pending' once `ms`
 * pass. The SDK can't cancel a send, so after the timeout a late result is
 * ignored: a late success shows up via the `message` listener, and a late
 * rejection is swallowed so it never surfaces as a second error.
 */
function sendWithTimeout(promise: Promise<unknown>, ms: number): Promise<SendOutcome> {
  return new Promise<SendOutcome>((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      settled = true
      resolve('pending')
    }, ms)
    promise.then(
      () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve('sent')
      },
      (err: unknown) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

/**
 * Amazon IVS Chat transport.
 *
 * Tokens are single-use, so the SDK's tokenProvider fetches a fresh one on every
 * (re)connect — except the very first connect, which reuses the token fetched to
 * learn the room's region. Every token fetched reports its `canSend` (false =
 * banned buyer, receive-only token).
 *
 * A ban is not a stop: IVS disconnects the banned user (DisconnectUser →
 * `userDisconnect` for our own id, then a `serverDisconnect`), and we reconnect
 * right away with a fresh, receive-only token. An unban arrives as the
 * `chat-user-unbanned` room event; for our own id we reconnect the same way to
 * pick up a send-capable token. Neither event is forwarded to the UI.
 *
 * A token error other than 503/network halts the transport: the provider then
 * rejects at once without calling the backend and no reconnect is scheduled.
 * Terminal stops (live ended/not active, no room, unknown live) are final; any
 * other halt — including running out of reconnect attempts — is re-armed when
 * the device comes back online or the tab becomes visible again.
 */
export function createIvsChatTransport(
  liveId: string,
  handlers: ChatTransportHandlers,
  deps: IvsChatTransportDeps,
): ChatTransport {
  const loadSdk = deps.loadSdk ?? loadIvsSdk
  const tokenRetryDelayMs = deps.tokenRetryDelayMs ?? TOKEN_RETRY_DELAY_MS

  let disposed = false
  let terminal = false
  let halted = false
  let starting = false
  let selfUserId = ''
  let sdk: IvsSdk | null = null
  let room: ChatRoom | null = null
  let prefetched: ChatToken | null = null
  let hasConnected = false
  let reconnectAttempt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  const unsubscribers: Array<() => void> = []

  const isActive = () => !disposed && !terminal && !halted

  async function requestToken(): Promise<GetIvsChatTokenResult> {
    try {
      return await deps.requestToken(liveId)
    } catch {
      // The server action call itself failed (offline, deploy) — retryable.
      return { ok: false, status: 0, code: null, error: CHAT_NETWORK_ERROR }
    }
  }

  function clearReconnect() {
    if (reconnectTimer !== null) clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  function stop(kind: ChatStopKind) {
    if (terminal) return
    clearReconnect()
    const isTerminal = isTerminalChatStop(kind)
    if (isTerminal) terminal = true
    else halted = true
    if (disposed) return
    // Drop any in-flight SDK connection so the room ends 'disconnected' and a
    // later resume() can re-arm it; its pending token requests now reject
    // without calling the backend.
    if (!isTerminal && room && room.state !== 'disconnected') room.disconnect()
    handlers.onConnectionChange(false)
    if (!isTerminal) handlers.onGaveUp()
  }

  function scheduleReconnect(run: () => void) {
    clearReconnect()
    const wait = reconnectDelayMs(reconnectAttempt)
    if (wait === null) {
      // Out of attempts: stay disconnected until the device/tab resumes.
      halted = true
      handlers.onGaveUp()
      return
    }
    reconnectAttempt += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (isActive()) run()
    }, wait)
  }

  async function tokenProvider(): Promise<ChatToken> {
    if (!isActive()) throw new Error('IVS chat stopped')
    if (prefetched) {
      const token = prefetched
      prefetched = null
      return token
    }
    const result = await requestToken()
    if (result.ok) {
      if (isActive()) handlers.onSendPermission(result.data.canSend)
      return toChatToken(result.data)
    }

    const kind = classifyChatTokenError(result.status, result.code)
    if (kind !== 'retryable') {
      stop(kind)
      throw new Error(`IVS chat token rejected: ${kind}`)
    }
    // The SDK retries immediately after a rejection; slow it down a little.
    await delay(tokenRetryDelayMs)
    throw new Error('IVS chat token temporarily unavailable')
  }

  function connectRoom() {
    if (!room || !isActive()) return
    try {
      room.connect()
    } catch {
      // Already connecting/connected.
    }
  }

  /** Drops the current connection and opens a new one, which fetches a fresh
   * token (and its canSend). Used after our own ban/unban. */
  function reconnectWithFreshToken(chatRoom: ChatRoom) {
    if (!isActive()) return
    clearReconnect()
    reconnectAttempt = 0
    chatRoom.disconnect() // 'clientDisconnect': ignored by the disconnect listener
    connectRoom()
  }

  function attachListeners(chatRoom: ChatRoom) {
    unsubscribers.push(
      chatRoom.addListener('connecting', () => {
        handlers.onConnectionChange(false)
      }),
      chatRoom.addListener('connect', () => {
        if (!isActive()) return
        reconnectAttempt = 0
        handlers.onConnectionChange(true)
        if (hasConnected) void handlers.loadHistory('gap')
        hasConnected = true
      }),
      chatRoom.addListener('disconnect', (reason) => {
        handlers.onConnectionChange(false)
        if (!isActive() || reason === 'clientDisconnect') return
        // socketError / fetchTokenError (SDK retries exhausted) or serverDisconnect
        // (e.g. a ban whose userDisconnect event we missed): reconnect with
        // backoff and a fresh token. An ended live surfaces as a terminal token
        // error on the next attempt, which stops the loop.
        scheduleReconnect(connectRoom)
      }),
      chatRoom.addListener('message', (message) => {
        handlers.onMessage(mapIvsMessage(message, selfUserId))
      }),
      chatRoom.addListener('event', (event) => {
        const parsed = parseRoomEvent(event.eventName, event.attributes)
        if (!parsed) return
        if (parsed.type === 'chat-user-unbanned') {
          // Never shown; only our own unban matters (fresh token → canSend=true).
          if (isSelfUnbanEvent(parsed, selfUserId)) reconnectWithFreshToken(chatRoom)
          return
        }
        handlers.onRoomEvent(parsed)
        if (parsed.type === 'live-ended') {
          // The room is deleted right after: don't try to reconnect to it.
          stop('live-ended')
          chatRoom.disconnect()
        }
      }),
      chatRoom.addListener('messageDelete', (event) => {
        handlers.onMessageDeleted(event.messageId)
      }),
      chatRoom.addListener('userDisconnect', (event) => {
        // A ban (DisconnectUser): stay in the room read-only. The fresh token
        // comes back with canSend=false; this is not a fatal stop.
        if (!selfUserId || event.userId !== selfUserId) return
        reconnectWithFreshToken(chatRoom)
      }),
    )
  }

  async function start() {
    if (starting) return
    starting = true
    try {
      const first = await requestToken()
      if (!isActive()) return

      if (!first.ok) {
        const kind = classifyChatTokenError(first.status, first.code)
        if (kind === 'retryable') scheduleReconnect(() => void start())
        else stop(kind)
        return
      }

      selfUserId = first.data.userId
      handlers.onIdentity(selfUserId)
      handlers.onSendPermission(first.data.canSend)

      if (!sdk) {
        try {
          sdk = await loadSdk()
        } catch (err) {
          // Chunk load failed (offline, stale deploy): surface it like any other
          // resumable stop so the UI shows the chat as lost; resume() retries.
          console.error('[live-chat] failed to load the IVS chat SDK', err)
          stop('fatal')
          return
        }
      }
      if (!isActive()) return

      prefetched = toChatToken(first.data)
      const chatRoom = new sdk.ChatRoom({
        regionOrUrl: first.data.region,
        tokenProvider,
        maxReconnectAttempts: SDK_MAX_RECONNECT_ATTEMPTS,
      })
      chatRoom.logLevel = 'error'
      room = chatRoom
      attachListeners(chatRoom)
      connectRoom()
      // History loads alongside the connection; the hook dedupes on
      // providerMessageId, so live messages may arrive first.
      void handlers.loadHistory('initial')
    } finally {
      starting = false
    }
  }

  function resume() {
    if (disposed || terminal) return
    if (room && room.state !== 'disconnected') {
      if (!halted) return // already (re)connecting or connected
      room.disconnect() // halted mid-connect: reset before re-arming
    }
    if (!room && (starting || reconnectTimer !== null)) return
    halted = false
    reconnectAttempt = 0
    clearReconnect()
    if (room) connectRoom()
    else void start()
  }

  return {
    connect() {
      unsubscribers.push((deps.subscribeResume ?? subscribeBrowserResume)(resume))
      void start()
    },
    disconnect() {
      disposed = true
      clearReconnect()
      unsubscribers.splice(0).forEach((off) => off())
      room?.disconnect()
      room = null
    },
    send(text: string): Promise<SendOutcome> {
      if (!room || !sdk || room.state !== 'connected') return Promise.reject(new Error('Room is not connected'))
      // No optimistic bubble: the message shows up when the room delivers it.
      return sendWithTimeout(room.sendMessage(new sdk.SendMessageRequest(text)), SEND_TIMEOUT_MS)
    },
  }
}
