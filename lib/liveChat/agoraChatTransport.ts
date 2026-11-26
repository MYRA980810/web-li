/* eslint-disable @typescript-eslint/no-explicit-any -- agora-rtm-sdk 1.x ships no usable types */
import { getChatToken } from '@/lib/liveActions'
import { mapAgoraMessage, optimisticOwnMessage } from './chatMessages'
import { parseAgoraSystemMessage } from './roomEvents'
import type { ChatTransport, ChatTransportHandlers, SendOutcome } from './chatTransport'

/**
 * Legacy Agora RTM chat (behavior unchanged from the original useLiveChat):
 * optimistic own messages, history gap fill on RECONNECTING → CONNECTED.
 */
export function createAgoraChatTransport(liveId: string, handlers: ChatTransportHandlers): ChatTransport {
  let disposed = false
  let rtmUid = ''
  let client: any = null
  let channel: any = null

  async function start() {
    const tokenResult = await getChatToken(liveId)
    if (disposed || !tokenResult.ok) return

    const { token, channelName, appId } = tokenResult.data
    rtmUid = tokenResult.data.rtmUid
    handlers.onIdentity(rtmUid)

    // Initial history load — one single request on mount
    await handlers.loadHistory('initial')
    if (disposed) return

    const mod = await import('agora-rtm-sdk')
    const AgoraRTM = (mod.default ?? mod) as any
    if (disposed) return

    const rtmClient = AgoraRTM.createInstance ? AgoraRTM.createInstance(appId) : new AgoraRTM(appId)
    client = rtmClient

    // Track previous RTM state to detect reconnection (RECONNECTING → CONNECTED)
    let prevRtmState = 'CONNECTING'
    rtmClient.on('ConnectionStateChanged', (newState: string) => {
      if (disposed) return
      const wasReconnecting = prevRtmState === 'RECONNECTING'
      prevRtmState = newState
      handlers.onConnectionChange(newState === 'CONNECTED')
      // Reconnected after a drop — fetch latest history once to fill the gap
      if (newState === 'CONNECTED' && wasReconnecting) void handlers.loadHistory('gap')
    })

    try {
      await rtmClient.login({ uid: rtmUid, token })
    } catch {
      return
    }
    if (disposed) return

    const rtmChannel = rtmClient.createChannel(channelName)
    channel = rtmChannel

    rtmChannel.on('ChannelMessage', (message: { text: string }, memberId: string) => {
      if (disposed) return
      const system = parseAgoraSystemMessage(message.text, memberId)
      if (system.handled) {
        if (system.event) handlers.onRoomEvent(system.event)
        return
      }
      handlers.onMessage(mapAgoraMessage(message.text, memberId, rtmUid))
    })

    try {
      await rtmChannel.join()
      if (!disposed) handlers.onConnectionChange(true)
    } catch {
      // RTM unavailable — UI shows history-only
    }
  }

  return {
    connect() {
      void start()
    },
    disconnect() {
      disposed = true
      const ch = channel
      const cl = client
      channel = null
      client = null
      if (ch) ch.leave().catch(() => {})
      if (cl) cl.logout().catch(() => {})
    },
    async send(text: string): Promise<SendOutcome> {
      handlers.onMessage(optimisticOwnMessage(text, rtmUid))
      if (!channel) return 'sent'
      try {
        await channel.sendMessage({ text })
      } catch {
        // RTM send failed — message already shown locally
      }
      return 'sent'
    },
  }
}
