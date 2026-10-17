'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { SpeakerIcon } from '@/components/icons/LiveActionIcons'
import { formatVolumeLabel, volumeToPercent } from '../_lib/liveAudio'

const KEYBOARD_STEP = 0.1

export type LiveAudioControlProps = {
  muted: boolean
  volume: number
  /** False where volume is hardware-only (iOS Safari): mute toggle only. */
  adjustable: boolean
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
}

/**
 * Round button toggles mute. Where volume is adjustable, the label under it
 * is a second button that reveals a vertical native range slider (keyboard
 * operable, exposes aria-valuenow); arrow keys on the main button also step
 * the volume.
 */
export function LiveAudioControl({ muted, volume, adjustable, onToggleMute, onVolumeChange }: LiveAudioControlProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const sliderId = useId()
  const label = formatVolumeLabel({ volume, muted, adjustable })
  const percent = muted ? 0 : volumeToPercent(volume)
  const sliderOpen = adjustable && open

  // Close on outside pointer — Safari doesn't focus buttons on click, so a
  // blur-based close alone wouldn't fire there.
  useEffect(() => {
    if (!sliderOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [sliderOpen])

  function onMainKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!adjustable) return
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const base = muted ? 0 : volume
    onVolumeChange(base + (e.key === 'ArrowUp' ? KEYBOARD_STEP : -KEYBOARD_STEP))
  }

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col items-center gap-1.5"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <button
        type="button"
        onClick={onToggleMute}
        onKeyDown={onMainKeyDown}
        aria-pressed={!muted}
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        className="live-player-round-btn"
      >
        <SpeakerIcon muted={muted} />
      </button>

      {adjustable ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={sliderOpen}
          aria-controls={sliderId}
          aria-label={`Ajustar volumen (${label})`}
          className="live-player-rail-label"
        >
          {label}
        </button>
      ) : (
        <span className="live-player-rail-label" aria-live="polite">
          {label}
        </span>
      )}

      {sliderOpen && (
        <div id={sliderId} className="live-player-volume-pop">
          <span className="text-[11px] font-bold text-white/80" aria-hidden="true">
            {percent}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={percent}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            aria-label="Volumen"
            aria-valuetext={muted ? 'Silencio' : `${percent}%`}
            autoFocus
            className="live-player-volume-slider"
          />
        </div>
      )}
    </div>
  )
}
