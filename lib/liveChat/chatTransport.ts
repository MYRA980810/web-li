import type { ChatMessage } from './chatMessages'
import type { RoomEvent } from './roomEvents'

/** Callbacks a transport uses to push state into useLiveChat. */
export type ChatTransportHandlers = {
  /** Current user id resolved (RTM uid / JWT sub), before any message is delivered. */
  onIdentity: (selfUserId: string) => void
  /** Loads history: 'initial' once before joining, 'gap' after a reconnect. */
  loadHistory: (mode: 'initial' | 'gap') => Promise<void>
  onMessage: (message: ChatMessage) => void
  onRoomEvent: (event: RoomEvent) => void
  onMessageDeleted: (messageId: string) => void
  onConnectionChange: (connected: boolean) => void
  /** Whether the current connection's token may send messages. IVS reports
   * it for every token fetched (false = banned, receive-only); Agora never
   * calls it (always allowed). */
  onSendPermission: (canSend: boolean) => void
  /** Reconnect attempts exhausted; the transport retries again once the
   * device comes back online or the tab becomes visible. */
  onGaveUp: () => void
}

/** 'pending': not confirmed in time — probably sent, may still appear. */
export type SendOutcome = 'sent' | 'pending'

export interface ChatTransport {
  /** Starts connecting in the background; failures are reported via handlers. */
  connect: () => void
  /** Tears everything down; no handler is called afterwards. */
  disconnect: () => void
  /** Rejects with the provider error when the message is not accepted. */
  send: (text: string) => Promise<SendOutcome>
}
