import type { ChatMessage } from '@/hooks/useLiveChat'
import { recentMessages } from '../_lib/livePlayerView'

const VISIBLE_MESSAGES = 6

export type LiveChatOverlayProps = {
  messages: ChatMessage[]
}

export function LiveChatOverlay({ messages }: LiveChatOverlayProps) {
  const visible = recentMessages(messages, VISIBLE_MESSAGES)

  return (
    <ul
      aria-label="Chat del live"
      aria-live="polite"
      className="live-player-chat flex flex-col justify-end gap-2 min-w-0 max-h-64 overflow-hidden pt-6"
    >
      {visible.map((m) => (
        <li key={m.id} className="min-w-0">
          <p className="live-player-chat-bubble text-[15px] leading-snug text-white/95 wrap-break-word">
            <span className="font-display font-extrabold mr-1.5" style={{ color: m.color }}>
              {m.username}
            </span>
            {m.isHost && (
              <span className="mr-1.5 rounded-full bg-brand-500 px-1.5 py-px align-middle text-[10px] font-bold uppercase tracking-wide text-white">
                Anfitrión
              </span>
            )}
            {m.content}
          </p>
        </li>
      ))}
    </ul>
  )
}
