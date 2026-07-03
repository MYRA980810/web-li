'use client'

import { useState } from 'react'
import { HotProductFields, emptyHotProductDraft, type HotProductDraft } from '@/components/HotProductFields'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (draft: HotProductDraft) => void
}

// Same fields as LiveAddProductDrawer, but the live doesn't exist yet at
// this point in the flow — so this just collects a draft in memory instead
// of calling addHotLiveProduct. The parent submits every draft once
// createLive resolves and a real liveId exists.
export function HotProductDrawer({ open, onClose, onAdd }: Props) {
  const [draft, setDraft] = useState<HotProductDraft>(emptyHotProductDraft)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function handleReset() {
    setDraft(emptyHotProductDraft)
    setError(null)
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  function handleAdd() {
    if (!draft.name.trim()) return
    const stockVal = parseInt(draft.stock, 10)
    if (!stockVal || stockVal < 1) {
      setError('El stock debe ser mínimo 1')
      return
    }

    onAdd(draft)
    handleReset()
    onClose()
  }

  return (
    <>
      <div className="live-stock-overlay" onClick={handleClose} aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Añadir Producto Nuevo"
      >
        <div className="live-stock-handle" />

        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <span className="live-stock-title">Añadir Producto Nuevo</span>
          </div>
          <button
            className="live-stock-close"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          <div className="live-add-form">
            <HotProductFields idPrefix="new-hot" draft={draft} onChange={setDraft} />
            {error && (
              <p style={{ color: '#ff4d6d', fontSize: '13px', margin: 0 }}>{error}</p>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <button
            type="button"
            className="live-picker-cta"
            onClick={handleAdd}
            disabled={!draft.name.trim()}
          >
            Añadir a la Lista
          </button>
        </div>
      </div>
    </>
  )
}
