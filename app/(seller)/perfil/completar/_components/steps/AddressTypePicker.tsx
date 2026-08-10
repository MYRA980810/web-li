'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ADDRESS_TYPE_META, type AddressType } from '@/lib/types'

const ADDRESS_TYPES = Object.keys(ADDRESS_TYPE_META) as AddressType[]

export type AddressTypePickerProps = {
  open: boolean
  value: AddressType | null
  onSelect: (type: AddressType) => void
  onClose: () => void
}

export function AddressTypePicker({ open, value, onSelect, onClose }: AddressTypePickerProps) {
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe portal mount guard, no non-effect equivalent (mandated pattern, see AGENTS.md Bottom Nav Pattern)
  useEffect(() => setMounted(true), [])

  if (!mounted || !open) return null

  return (
    // key remounts on open, resetting `pending` to the latest `value` without an effect
    <AddressTypePickerContent key={open ? 'open' : 'closed'} value={value} onSelect={onSelect} onClose={onClose} />
  )
}

function AddressTypePickerContent({
  value,
  onSelect,
  onClose,
}: Pick<AddressTypePickerProps, 'value' | 'onSelect' | 'onClose'>) {
  const [pending, setPending] = useState<AddressType | null>(value)

  function handleConfirm() {
    if (!pending) return
    onSelect(pending)
    onClose()
  }

  return createPortal(
    <div className="address-type-overlay" role="dialog" aria-modal="true" aria-label="Tipo de inmueble">
      <div className="px-5 pt-6 pb-8 flex flex-col gap-6 flex-1">
        <div className="flex items-center gap-3">
          <button type="button" className="store-back-btn" onClick={onClose} aria-label="Cerrar">
            ←
          </button>
          <span className="eyebrow">Dirección</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display font-extrabold text-[22px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
            ¿Qué tipo de inmueble es?
          </h2>
          <p className="text-[13px] text-(--ink-2)">Elegí la opción que mejor describe esta dirección.</p>
        </div>

        <div className="address-type-grid">
          {ADDRESS_TYPES.map((type) => {
            const meta = ADDRESS_TYPE_META[type]
            const selected = pending === type
            return (
              <button
                key={type}
                type="button"
                className={`address-type-card${selected ? ' selected' : ''}`}
                onClick={() => setPending(type)}
              >
                <div className={`address-icon ${meta.variant}`}>{meta.emoji}</div>
                <span className="text-[13px] font-bold text-(--ink-0)">{meta.label}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="live-launch-btn w-full justify-center mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!pending}
          onClick={handleConfirm}
        >
          Continuar
        </button>
      </div>
    </div>,
    document.body
  )
}
