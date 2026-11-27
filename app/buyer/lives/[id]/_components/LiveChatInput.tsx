'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { SendIcon } from '@/components/icons/LiveActionIcons'

export type LiveChatInputProps = {
  /** Resolves true when sent; the draft is kept on failure. */
  onSend: (text: string) => Promise<boolean>
  /** Owned by the parent so the draft survives this input being unmounted
   * (e.g. swapped for the banned notice and back after an unban). */
  draft: string
  onDraftChange: Dispatch<SetStateAction<string>>
  /** 500 for IVS lives, 300 for Agora lives. */
  maxLength: number
  disabled?: boolean
  /** Last send rejection, shown above the input. */
  error?: string | null
}

export function LiveChatInput({
  onSend,
  draft: text,
  onDraftChange: setText,
  maxLength,
  disabled = false,
  error = null,
}: LiveChatInputProps) {
  const [sending, setSending] = useState(false)
  const canSend = !disabled && !sending && text.trim().length > 0

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSend) return
    const sent = text.trim()
    setSending(true)
    const ok = await onSend(sent)
    setSending(false)
    // Clear only if the draft wasn't edited meanwhile.
    if (ok) setText((current) => (current.trim() === sent ? '' : current))
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-1.5">
      {error && (
        <p role="alert" className="text-[12px] font-semibold text-red-300">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe en el chat..."
          aria-label="Mensaje para el chat"
          maxLength={maxLength}
          enterKeyHint="send"
          autoComplete="off"
          disabled={disabled}
          className="live-player-chat-input"
        />
        <button type="submit" disabled={!canSend} aria-label="Enviar mensaje" className="live-player-round-btn">
          <SendIcon />
        </button>
      </div>
    </form>
  )
}
