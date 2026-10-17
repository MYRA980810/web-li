'use client'

import { useCallback, useRef, useState } from 'react'
import { followStore, unfollowStore } from '@/lib/buyerStoreActions'

export type StoreFollowState = {
  following: boolean
  followerCount: number
  pending: boolean
  error: string | null
  toggleFollow: () => void
}

/** Optimistic follow/unfollow for the live's store; reverts on failure. */
export function useStoreFollow(storeId: string, initialFollowing: boolean, initialCount: number): StoreFollowState {
  const [following, setFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef(false)

  const toggleFollow = useCallback(() => {
    if (pendingRef.current) return
    pendingRef.current = true
    const next = !following
    setFollowing(next)
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)))
    setPending(true)
    setError(null)

    const revert = (message: string) => {
      setFollowing(!next)
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)))
      setError(message)
    }

    void (next ? followStore(storeId) : unfollowStore(storeId))
      .then((result) => {
        if (!result.ok) revert(result.error)
      })
      .catch(() => revert('No se pudo conectar con el servidor'))
      .finally(() => {
        pendingRef.current = false
        setPending(false)
      })
  }, [following, storeId])

  return { following, followerCount, pending, error, toggleFollow }
}
