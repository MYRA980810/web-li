'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  listChatBans,
  unbanChatUser,
  type ChatModerationResult,
  type ListChatBansResult,
} from '@/lib/liveActions'
import type { ChatBan } from '@/lib/liveChat/chatBans'
import { chatBansReducer, initialChatBansState, type ChatBansStatus } from '@/lib/liveChat/chatBansState'
import { CHAT_NETWORK_ERROR } from '@/lib/liveChat/chatErrors'

export type { ChatBansStatus } from '@/lib/liveChat/chatBansState'

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

/** Seller's chat ban list (IVS only; pass enabled=false for Agora lives). */
export function useChatBans(liveId: string, enabled: boolean): UseChatBansReturn {
  const [state, dispatch] = useReducer(chatBansReducer, enabled, initialChatBansState)

  // Ids for list requests: only the latest one settles the state (see chatBansReducer).
  const requestIdRef = useRef(0)

  const fetchBans = useCallback(() => {
    const requestId = ++requestIdRef.current
    dispatch({ type: 'fetch-start', requestId })
    listChatBans(liveId)
      .catch((): ListChatBansResult => ({ ok: false, error: CHAT_NETWORK_ERROR }))
      .then((result) => dispatch({ type: 'fetch-settled', requestId, result }))
  }, [liveId])

  // Initial load so the shield badge reflects bans from earlier lives.
  useEffect(() => {
    if (enabled) fetchBans()
  }, [enabled, fetchBans])

  const refresh = useCallback(() => {
    if (enabled) fetchBans()
  }, [enabled, fetchBans])

  const recordBan = useCallback((ban: ChatBan) => {
    dispatch({ type: 'ban-recorded', ban })
  }, [])

  const unban = useCallback(async (userId: string): Promise<ChatModerationResult> => {
    const result = await unbanChatUser(liveId, userId).catch(
      (): ChatModerationResult => ({ ok: false, error: CHAT_NETWORK_ERROR }),
    )
    if (result.ok) dispatch({ type: 'unbanned', userId })
    return result
  }, [liveId])

  return { bans: state.bans, status: state.status, error: state.error, refresh, recordBan, unban }
}
