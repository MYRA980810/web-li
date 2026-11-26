'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  listChatBans,
  unbanChatUser,
  type ChatModerationResult,
  type ListChatBansResult,
} from '@/lib/liveActions'
import { addChatBan, removeChatBan, type ChatBan } from '@/lib/liveChat/chatBans'

export type ChatBansStatus = 'idle' | 'loading' | 'ready' | 'error'

export type UseChatBansReturn = {
  bans:   ChatBan[]
  status: ChatBansStatus
  /** Last list fetch error (the list keeps the locally known bans). */
  error:  string | null
  /** Refetch; call from the event that opens the list (and from retry). */
  refresh:    () => void
  /** Optimistic add after a successful ban. */
  recordBan:  (ban: ChatBan) => void
  unban:      (userId: string) => Promise<ChatModerationResult>
}

const NETWORK_ERROR = 'No se pudo conectar con el servidor'

/** Seller's chat ban list (IVS only; pass enabled=false for Agora lives). */
export function useChatBans(liveId: string, enabled: boolean): UseChatBansReturn {
  const [bans,   setBans]   = useState<ChatBan[]>([])
  const [status, setStatus] = useState<ChatBansStatus>(enabled ? 'loading' : 'idle')
  const [error,  setError]  = useState<string | null>(null)

  // Bumped on every local mutation and every fetch: a fetch result is only
  // applied if nothing changed since it started, so it never undoes an
  // optimistic add/remove that raced with it.
  const versionRef = useRef(0)

  const applyFetch = useCallback((result: ListChatBansResult, version: number) => {
    if (versionRef.current !== version) return
    if (result.ok) {
      setBans(result.bans)
      setError(null)
      setStatus('ready')
    } else {
      setError(result.error)
      setStatus('error')
    }
  }, [])

  const fetchBans = useCallback(() => {
    const version = ++versionRef.current
    listChatBans(liveId)
      .catch((): ListChatBansResult => ({ ok: false, error: NETWORK_ERROR }))
      .then((result) => applyFetch(result, version))
  }, [liveId, applyFetch])

  // Initial load so the shield badge reflects bans from earlier lives.
  useEffect(() => {
    if (enabled) fetchBans()
  }, [enabled, fetchBans])

  const refresh = useCallback(() => {
    if (!enabled) return
    setStatus('loading')
    fetchBans()
  }, [enabled, fetchBans])

  const recordBan = useCallback((ban: ChatBan) => {
    versionRef.current++
    setBans((prev) => addChatBan(prev, ban))
  }, [])

  const unban = useCallback(async (userId: string): Promise<ChatModerationResult> => {
    const result = await unbanChatUser(liveId, userId).catch(
      (): ChatModerationResult => ({ ok: false, error: NETWORK_ERROR }),
    )
    if (result.ok) {
      versionRef.current++
      setBans((prev) => removeChatBan(prev, userId))
    }
    return result
  }, [liveId])

  return { bans, status, error, refresh, recordBan, unban }
}
