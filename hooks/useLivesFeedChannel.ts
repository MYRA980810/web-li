'use client'

import { useEffect, useRef, useState } from 'react'
import { getLiveFeedToken } from '@/lib/liveActions'

export type UseLivesFeedChannelOptions = {
  onLiveStarted?: (liveId: string) => void
  onLiveEnded?:   (liveId: string) => void
  onResync?:      () => void
}

type UseLivesFeedChannelReturn = {
  isConnected: boolean
}

function handleFeedMessage(text: string, options: UseLivesFeedChannelOptions): void {
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(text) as Record<string, unknown>
  } catch {
    return
  }

  const type   = payload.type as string | undefined
  const liveId = payload.liveId as string | undefined
  if (!type || !liveId) return

  if (type === 'live-started') options.onLiveStarted?.(liveId)
  else if (type === 'live-ended') options.onLiveEnded?.(liveId)
}

/** Joins the global "lives-feed" Agora RTM broadcast channel and dispatches
 * live-started/live-ended events — used to keep the buyer lives explorer
 * live without polling. The channel carries no history, so onResync fires
 * after a reconnect (RECONNECTING → CONNECTED) so the caller can refetch and
 * catch anything missed during the drop. */
export function useLivesFeedChannel(options: UseLivesFeedChannelOptions = {}): UseLivesFeedChannelReturn {
  const [isConnected, setIsConnected] = useState(false)

  const channelRef = useRef<unknown>(null)
  const clientRef  = useRef<unknown>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    let isMounted = true

    async function connect() {
      const tokenResult = await getLiveFeedToken()
      if (!isMounted || !tokenResult.ok) return

      const { token, channelName, appId, rtmUid } = tokenResult.data

      const mod = await import('agora-rtm-sdk')
      const AgoraRTM = (mod.default ?? mod) as any
      if (!isMounted) return

      const client = AgoraRTM.createInstance
        ? AgoraRTM.createInstance(appId)
        : new AgoraRTM(appId)
      clientRef.current = client

      // Track previous RTM state to detect reconnection (RECONNECTING → CONNECTED)
      let prevRtmState = 'CONNECTING'
      client.on('ConnectionStateChanged', (newState: string) => {
        if (!isMounted) return

        const wasReconnecting = prevRtmState === 'RECONNECTING'
        prevRtmState = newState

        setIsConnected(newState === 'CONNECTED')

        if (newState === 'CONNECTED' && wasReconnecting) {
          optionsRef.current.onResync?.()
        }
      })

      try {
        await (client as any).login({ uid: rtmUid, token })
      } catch {
        return
      }
      if (!isMounted) return

      const channel = (client as any).createChannel(channelName)
      channelRef.current = channel

      channel.on('ChannelMessage', (message: { text: string }) => {
        if (!isMounted) return
        handleFeedMessage(message.text, optionsRef.current)
      })

      try {
        await channel.join()
        if (isMounted) setIsConnected(true)
      } catch {
        // RTM unavailable — explorer falls back to whatever was server-fetched
      }
    }

    connect()

    return () => {
      isMounted = false
      const ch = channelRef.current as any
      const cl = clientRef.current as any
      channelRef.current = null
      clientRef.current  = null
      if (ch) ch.leave().catch(() => {})
      if (cl) cl.logout().catch(() => {})
      setIsConnected(false)
    }
  }, [])

  return { isConnected }
}
