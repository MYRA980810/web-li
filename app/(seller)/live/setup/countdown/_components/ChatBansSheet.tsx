'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChatBansStatus } from '@/hooks/useChatBans'
import type { ChatModerationResult } from '@/lib/liveActions'
import { formatBannedAgo, userInitial, type ChatBan } from '@/lib/liveChat/chatBans'

export type ChatBansSheetProps = {
  bans: ChatBan[]
  status: ChatBansStatus
  error: string | null
  /** Timestamp the sheet was opened at; relative times are computed against it. */
  now: number
  onClose: () => void
  onRetry: () => void
  onUnban: (userId: string) => Promise<ChatModerationResult>
}

/**
 * "Bloqueados" sheet opened from the header shield. Mount it only after a user
 * tap (never during SSR); portaled to <body> like ChatMessageSheet.
 */
export function ChatBansSheet({ bans, status, error, now, onClose, onRetry, onUnban }: ChatBansSheetProps) {
  const [unbanningId, setUnbanningId] = useState<string | null>(null)
  const [unbanError,  setUnbanError]  = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleUnban(userId: string) {
    setUnbanningId(userId)
    setUnbanError(null)
    const result = await onUnban(userId)
    setUnbanningId(null)
    if (!result.ok) setUnbanError(result.error)
  }

  const countLabel = bans.length === 1 ? '1 usuario' : `${bans.length} usuarios`
  const showSpinnerOnly = status === 'loading' && bans.length === 0

  return createPortal(
    <>
      <div className="live-stock-overlay" onClick={onClose} aria-hidden="true" />

      <div className="live-stock-drawer" role="dialog" aria-modal="true" aria-label="Usuarios bloqueados">
        <div className="live-stock-handle" />

        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <span className="live-stock-title">Bloqueados</span>
            <span className="text-[13px] font-semibold text-(--ink-3)">{countLabel}</span>
          </div>
          <button className="live-stock-close" onClick={onClose} aria-label="Cerrar" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body gap-3!">
          {(error || unbanError) && status !== 'loading' && (
            <div className="flex items-center justify-between gap-3" role="alert">
              <p className="live-stock-status-text live-stock-status-error m-0 p-0! text-left!">
                {unbanError ?? error}
              </p>
              {!unbanError && (
                <button type="button" className="chat-ban-unblock-btn" onClick={onRetry}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {showSpinnerOnly && <p className="live-stock-status-text">Cargando...</p>}

          {!showSpinnerOnly && bans.length === 0 && status !== 'error' && (
            <p className="live-stock-status-text">
              No has bloqueado a nadie. Toca un mensaje del chat para moderar.
            </p>
          )}

          {bans.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {bans.map((ban) => {
                const ago = formatBannedAgo(ban.bannedAt, now)
                return (
                  <li key={ban.userId} className="chat-ban-row">
                    <span className="chat-mod-avatar is-muted" aria-hidden="true">
                      {userInitial(ban.displayName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[15px] font-bold text-(--ink-0)">{ban.displayName}</p>
                      <p className="m-0 text-[13px] text-(--ink-3)">
                        {ago ? `Bloqueado ${ago}` : 'Bloqueado'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="chat-ban-unblock-btn"
                      disabled={unbanningId !== null}
                      onClick={() => void handleUnban(ban.userId)}
                      aria-label={`Desbloquear a ${ban.displayName}`}
                    >
                      {unbanningId === ban.userId ? 'Desbloqueando...' : 'Desbloquear'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
