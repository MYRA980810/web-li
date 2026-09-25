'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getLiveSubscriptions, subscribeToLive, unsubscribeFromLive } from '@/lib/liveActions'

export type LiveReminders = {
  isSubscribed: (liveId: string) => boolean
  isPending: (liveId: string) => boolean
  toggle: (liveId: string) => void
  subscribeMany: (liveIds: string[]) => void
}

/**
 * Reminder ("Avisarme") state for upcoming lives. Lazily looks up the initial
 * subscribed flag for each newly loaded id (one batched server action per new
 * page), and applies optimistic subscribe/unsubscribe with revert on failure.
 * Lookup failures — including 401/403 for non-buyers — just mean "not subscribed".
 */
export function useLiveReminders(liveIds: string[]): LiveReminders {
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const requestedRef = useRef(new Set<string>())
  const pendingRef = useRef(new Set<string>())
  const idsKey = liveIds.join(',')

  useEffect(() => {
    const requested = requestedRef.current
    const missing = idsKey === '' ? [] : idsKey.split(',').filter((id) => !requested.has(id))
    if (missing.length === 0) return
    missing.forEach((id) => requested.add(id))

    let cancelled = false
    let settled = false
    getLiveSubscriptions(missing)
      .then((fetched) => {
        settled = true
        if (cancelled) return
        // Local toggles made while the lookup was in flight win over the fetched value.
        setSubscribed((prev) => ({ ...fetched, ...prev }))
      })
      .catch(() => {
        settled = true // lookup failure = not subscribed
      })
    return () => {
      cancelled = true
      // Allow a re-request if this run was discarded before its lookup settled
      // (e.g. StrictMode remount, or a new page arriving mid-flight).
      if (!settled) missing.forEach((id) => requested.delete(id))
    }
  }, [idsKey])

  const setOne = useCallback((liveId: string, value: boolean) => {
    setSubscribed((prev) => ({ ...prev, [liveId]: value }))
  }, [])

  const setPendingOne = useCallback((liveId: string, value: boolean) => {
    if (value) pendingRef.current.add(liveId)
    else pendingRef.current.delete(liveId)
    setPending((prev) => ({ ...prev, [liveId]: value }))
  }, [])

  const apply = useCallback(
    async (liveId: string, next: boolean) => {
      if (pendingRef.current.has(liveId)) return
      setPendingOne(liveId, true)
      setOne(liveId, next)
      try {
        const result = next ? await subscribeToLive(liveId) : await unsubscribeFromLive(liveId)
        if (!result.ok) setOne(liveId, !next)
      } catch {
        setOne(liveId, !next)
      } finally {
        setPendingOne(liveId, false)
      }
    },
    [setOne, setPendingOne],
  )

  const isSubscribed = useCallback((liveId: string) => subscribed[liveId] === true, [subscribed])
  const isPending = useCallback((liveId: string) => pending[liveId] === true, [pending])

  const toggle = useCallback(
    (liveId: string) => {
      void apply(liveId, !(subscribed[liveId] === true))
    },
    [apply, subscribed],
  )

  const subscribeMany = useCallback(
    (ids: string[]) => {
      ids.filter((id) => subscribed[id] !== true).forEach((id) => void apply(id, true))
    },
    [apply, subscribed],
  )

  return { isSubscribed, isPending, toggle, subscribeMany }
}
