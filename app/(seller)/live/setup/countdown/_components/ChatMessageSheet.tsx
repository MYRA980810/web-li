'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChatMessage } from '@/hooks/useLiveChat'
import type { ChatModerationResult } from '@/lib/liveActions'
import { userInitial } from '@/lib/liveChat/chatBans'

export type ChatMessageSheetProps = {
  message: ChatMessage
  onClose: () => void
  /** Resolves ok when the ban is committed; the parent closes the sheet. */
  onBan: (message: ChatMessage) => Promise<ChatModerationResult>
  onDelete: (message: ChatMessage) => Promise<ChatModerationResult>
}

type Step = 'actions' | 'confirm'
type Pending = 'ban' | 'delete' | null

/**
 * Moderation sheet for a tapped chat message (IVS only). Mount it only after a
 * user tap (never during SSR) and key it by message id so its state resets.
 * Portaled to <body> so `position: fixed` is relative to the viewport.
 */
export function ChatMessageSheet({ message, onClose, onBan, onDelete }: ChatMessageSheetProps) {
  const [step,    setStep]    = useState<Step>('actions')
  const [pending, setPending] = useState<Pending>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function run(kind: Exclude<Pending, null>, action: () => Promise<ChatModerationResult>) {
    setPending(kind)
    setError(null)
    const result = await action()
    setPending(null)
    if (!result.ok) {
      setError(result.error)
      setStep('actions')
    }
  }

  const name = message.username
  const busy = pending !== null

  return createPortal(
    <>
      <div className="live-stock-overlay" onClick={busy ? undefined : onClose} aria-hidden="true" />

      <div className="live-stock-drawer" role="dialog" aria-modal="true" aria-label={`Moderar a ${name}`}>
        <div className="live-stock-handle" />

        <div className="live-stock-body">
          <div className="flex items-center gap-4">
            <span className="chat-mod-avatar" style={{ background: message.color }} aria-hidden="true">
              {userInitial(name)}
            </span>
            <span className="min-w-0 truncate font-display text-xl font-extrabold text-(--ink-0)">
              {name}
            </span>
          </div>

          <p className="chat-mod-quote">&ldquo;{message.content}&rdquo;</p>

          {error && (
            <p className="live-stock-status-text live-stock-status-error p-0!" role="alert">{error}</p>
          )}

          {step === 'actions' ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="chat-mod-danger-btn"
                disabled={busy}
                onClick={() => { setError(null); setStep('confirm') }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M5.6 5.6l12.8 12.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Bloquear del chat
              </button>
              {message.providerMessageId && (
                <button
                  type="button"
                  className="chat-mod-text-btn"
                  disabled={busy}
                  onClick={() => void run('delete', () => onDelete(message))}
                >
                  {pending === 'delete' ? 'Eliminando...' : 'Eliminar este mensaje'}
                </button>
              )}
              <button type="button" className="chat-mod-text-btn" disabled={busy} onClick={onClose}>
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 font-display text-lg font-extrabold text-(--ink-0)">
                  ¿Bloquear a {name}?
                </h2>
                <p className="m-0 text-sm leading-relaxed text-(--ink-2)">
                  No podrá enviar mensajes en tu chat. Puedes desbloquearlo cuando quieras desde el escudo de arriba.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn-ghost flex-1 px-4!"
                  disabled={busy}
                  onClick={() => setStep('actions')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="live-add-cta flex-1 px-4!"
                  disabled={busy}
                  onClick={() => void run('ban', () => onBan(message))}
                >
                  {pending === 'ban' ? 'Bloqueando...' : 'Sí, bloquear'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
