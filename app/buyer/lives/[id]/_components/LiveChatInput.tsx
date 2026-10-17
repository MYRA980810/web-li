'use client'

import { useState } from 'react'
import { SendIcon } from '@/components/icons/LiveActionIcons'

const MAX_MESSAGE_LENGTH = 300

export type LiveChatInputProps = {
  onSend: (text: string) => void
  disabled?: boolean
}

export function LiveChatInput({ onSend, disabled = false }: LiveChatInputProps) {
  const [text, setText] = useState('')
  const canSend = !disabled && text.trim().length > 0

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe en el chat..."
        aria-label="Mensaje para el chat"
        maxLength={MAX_MESSAGE_LENGTH}
        enterKeyHint="send"
        autoComplete="off"
        disabled={disabled}
        className="live-player-chat-input"
      />
      <button type="submit" disabled={!canSend} aria-label="Enviar mensaje" className="live-player-round-btn">
        <SendIcon />
      </button>
    </form>
  )
}
