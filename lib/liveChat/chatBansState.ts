import type { ListChatBansResult } from '@/lib/liveActions'
import { addChatBan, removeChatBan, type ChatBan } from './chatBans'

export type ChatBansStatus = 'idle' | 'loading' | 'ready' | 'error'

type ChatBanMutation =
  | { type: 'ban-recorded'; ban: ChatBan }
  | { type: 'unbanned'; userId: string }

export type ChatBansState = {
  bans: ChatBan[]
  status: ChatBansStatus
  /** Last list fetch error (the list keeps the locally known bans). */
  error: string | null
  /** Id of the latest list request; only its response settles the state. */
  latestRequestId: number | null
  /** Local mutations made while the latest request was in flight, replayed
   * on top of its response so it never undoes an optimistic add/remove. */
  pendingMutations: ChatBanMutation[]
}

export type ChatBansAction =
  | { type: 'fetch-start'; requestId: number }
  | { type: 'fetch-settled'; requestId: number; result: ListChatBansResult }
  | ChatBanMutation

export function initialChatBansState(enabled: boolean): ChatBansState {
  return {
    bans: [],
    status: enabled ? 'loading' : 'idle',
    error: null,
    latestRequestId: null,
    pendingMutations: [],
  }
}

function applyMutation(bans: ChatBan[], mutation: ChatBanMutation): ChatBan[] {
  return mutation.type === 'ban-recorded'
    ? addChatBan(bans, mutation.ban)
    : removeChatBan(bans, mutation.userId)
}

/**
 * Seller chat ban list state. The latest list request always settles the
 * status (ready/error), so the list is never left 'loading'; a response from
 * an older request is ignored. Bans/unbans made while the latest request is
 * in flight apply at once and are replayed onto its response.
 */
export function chatBansReducer(state: ChatBansState, action: ChatBansAction): ChatBansState {
  switch (action.type) {
    case 'fetch-start':
      return { ...state, status: 'loading', latestRequestId: action.requestId, pendingMutations: [] }

    case 'fetch-settled': {
      if (action.requestId !== state.latestRequestId) return state
      const settled = { ...state, latestRequestId: null, pendingMutations: [] }
      if (!action.result.ok) return { ...settled, status: 'error', error: action.result.error }
      return {
        ...settled,
        status: 'ready',
        error: null,
        bans: state.pendingMutations.reduce(applyMutation, action.result.bans),
      }
    }

    case 'ban-recorded':
    case 'unbanned':
      return {
        ...state,
        bans: applyMutation(state.bans, action),
        pendingMutations: state.latestRequestId === null
          ? state.pendingMutations
          : [...state.pendingMutations, action],
      }
  }
}
