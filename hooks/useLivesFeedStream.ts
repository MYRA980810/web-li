'use client'

import { useEffect, useRef, useState } from 'react'
import { LiveFeedClient } from '@/lib/liveFeed/liveFeedClient'
import { openSseStream } from '@/lib/liveFeed/sseStream'
import { fetchStreamTicket, withTicketLock } from '@/lib/liveFeed/ticketClient'
import type { FeedState, FeedStatus } from '@/lib/liveFeed/types'

/** Hidden longer than this → close the stream to free the per-user slot (§6.2 step 13). */
const HIDDEN_GRACE_MS = 60_000

export type UseLivesFeedStreamOptions = {
  /** Stream URL; null disables the hook (feature flag off or not configured). */
  url: string | null
  /** Full current feed after every snapshot or applied event. Replace, never merge. */
  onFeed?: (feed: FeedState) => void
  onLiveStarted?: (liveId: string) => void
  onLiveEnded?: (liveId: string) => void
}

export type UseLivesFeedStreamReturn = {
  status: FeedStatus
}

/** Buyer lives feed over SSE (stream ticket + direct backend connection).
 * Same callback surface as useLivesFeedChannel, plus `onFeed` with the full
 * feed. One instance per tab. */
export function useLivesFeedStream({ url, ...callbacks }: UseLivesFeedStreamOptions): UseLivesFeedStreamReturn {
  const [status, setStatus] = useState<FeedStatus>('idle')
  const callbacksRef = useRef(callbacks)
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  useEffect(() => {
    if (!url) return

    const client = new LiveFeedClient({
      getTicket: (signal) => withTicketLock(() => fetchStreamTicket(fetch, signal), undefined, signal),
      openStream: (params) => openSseStream({ url, ...params }),
    })

    const unsubscribe = client.subscribe((event) => {
      const cb = callbacksRef.current
      switch (event.type) {
        case 'status':
          setStatus(event.status)
          // Session is gone: hand over to the login flow (§6.2 step 8).
          if (event.status === 'unauthenticated') window.location.assign('/login')
          break
        case 'snapshot':
          cb.onFeed?.(event.feed)
          break
        case 'added':
          cb.onFeed?.(event.feed)
          cb.onLiveStarted?.(event.liveId)
          break
        case 'removed':
          cb.onFeed?.(event.feed)
          cb.onLiveEnded?.(event.liveId)
          break
      }
    })

    let hiddenTimer: ReturnType<typeof setTimeout> | undefined
    const onVisibility = () => {
      clearTimeout(hiddenTimer)
      if (document.visibilityState === 'hidden') {
        hiddenTimer = setTimeout(() => client.pause(), HIDDEN_GRACE_MS)
      } else {
        client.resume()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    client.start()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(hiddenTimer)
      unsubscribe()
      client.stop()
    }
  }, [url])

  return { status }
}
