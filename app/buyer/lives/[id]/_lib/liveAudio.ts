// Pure audio helpers for the buyer live player. No React, no DOM globals —
// the volume-support probe receives its element through a factory so it can
// be unit tested and only runs on the client.

export const DEFAULT_VOLUME = 1
export const VOLUME_STORAGE_KEY = 'live-player-volume'

export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return DEFAULT_VOLUME
  return Math.min(1, Math.max(0, volume))
}

export function volumeToPercent(volume: number): number {
  return Math.round(clampVolume(volume) * 100)
}

export type VolumeLabelInput = {
  volume: number
  muted: boolean
  /** False where the browser ignores programmatic volume (iOS Safari). */
  adjustable: boolean
}

export function formatVolumeLabel({ volume, muted, adjustable }: VolumeLabelInput): string {
  if (muted) return 'Silencio'
  if (!adjustable) return 'Sonido'
  return `${volumeToPercent(volume)}%`
}

/** Reads a volume persisted in localStorage; anything invalid is ignored. */
export function parseStoredVolume(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0 || value > 1) return null
  return value
}

/** Dragging the slider is an explicit audio choice: above zero means "I want
 * sound", zero means silence. */
export function mutedAfterVolumeChange(volume: number): boolean {
  return clampVolume(volume) === 0
}

type VolumeProbe = { volume: number }

/**
 * iOS Safari exposes HTMLMediaElement.volume as read-only (hardware buttons
 * own it): writes are silently dropped and reads keep returning 1. Write a
 * test value and read it back to find out at runtime, then restore it.
 */
export function detectVolumeControl(createProbe: () => VolumeProbe): boolean {
  try {
    const probe = createProbe()
    const original = probe.volume
    const testValue = original === 0.5 ? 0.25 : 0.5
    probe.volume = testValue
    const supported = Math.abs(probe.volume - testValue) < 0.01
    probe.volume = original
    return supported
  } catch {
    return false
  }
}

/** Unmuting at volume 0 would stay silent while claiming sound is on. */
export function volumeForUnmute(volume: number): number {
  const value = clampVolume(volume)
  return value > 0 ? value : DEFAULT_VOLUME
}
