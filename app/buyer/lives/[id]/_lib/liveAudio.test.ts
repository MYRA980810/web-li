import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VOLUME,
  clampVolume,
  detectVolumeControl,
  formatVolumeLabel,
  mutedAfterVolumeChange,
  parseStoredVolume,
  volumeForUnmute,
  volumeToPercent,
} from './liveAudio'

describe('clampVolume', () => {
  it('keeps values inside 0..1', () => {
    expect(clampVolume(0.42)).toBe(0.42)
    expect(clampVolume(0)).toBe(0)
    expect(clampVolume(1)).toBe(1)
  })

  it('clamps out-of-range values', () => {
    expect(clampVolume(-0.2)).toBe(0)
    expect(clampVolume(1.7)).toBe(1)
  })

  it('falls back to the default volume for non-finite input', () => {
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_VOLUME)
    expect(clampVolume(Number.POSITIVE_INFINITY)).toBe(DEFAULT_VOLUME)
  })
})

describe('volumeToPercent', () => {
  it('rounds to an integer percentage', () => {
    expect(volumeToPercent(1)).toBe(100)
    expect(volumeToPercent(0.456)).toBe(46)
    expect(volumeToPercent(0)).toBe(0)
  })
})

describe('formatVolumeLabel', () => {
  it('shows the muted state regardless of volume', () => {
    expect(formatVolumeLabel({ volume: 0.8, muted: true, adjustable: true })).toBe('Silencio')
    expect(formatVolumeLabel({ volume: 1, muted: true, adjustable: false })).toBe('Silencio')
  })

  it('shows the percentage when volume is adjustable', () => {
    expect(formatVolumeLabel({ volume: 1, muted: false, adjustable: true })).toBe('100%')
    expect(formatVolumeLabel({ volume: 0.35, muted: false, adjustable: true })).toBe('35%')
  })

  it('does not show a misleading percentage when volume is hardware-controlled', () => {
    expect(formatVolumeLabel({ volume: 1, muted: false, adjustable: false })).toBe('Sonido')
  })
})

describe('parseStoredVolume', () => {
  it('parses a valid stored volume', () => {
    expect(parseStoredVolume('0.6')).toBe(0.6)
    expect(parseStoredVolume('0')).toBe(0)
    expect(parseStoredVolume('1')).toBe(1)
  })

  it('rejects missing, malformed and out-of-range values', () => {
    expect(parseStoredVolume(null)).toBeNull()
    expect(parseStoredVolume('')).toBeNull()
    expect(parseStoredVolume('loud')).toBeNull()
    expect(parseStoredVolume('1.5')).toBeNull()
    expect(parseStoredVolume('-0.1')).toBeNull()
  })
})

describe('mutedAfterVolumeChange', () => {
  it('unmutes when the user raises the volume above zero', () => {
    expect(mutedAfterVolumeChange(0.4)).toBe(false)
  })

  it('mutes when the user drags the volume to zero', () => {
    expect(mutedAfterVolumeChange(0)).toBe(true)
  })
})

describe('volumeForUnmute', () => {
  it('keeps the chosen volume when it is audible', () => {
    expect(volumeForUnmute(0.4)).toBe(0.4)
  })

  it('restores the default volume when unmuting from zero', () => {
    expect(volumeForUnmute(0)).toBe(DEFAULT_VOLUME)
  })
})

describe('detectVolumeControl', () => {
  it('reports support when the element accepts a volume write', () => {
    const probe = { volume: 1 }
    expect(detectVolumeControl(() => probe)).toBe(true)
  })

  it('reports no support when the volume write is ignored (iOS Safari)', () => {
    const probe = {
      get volume() {
        return 1
      },
      set volume(_value: number) {
        // iOS: HTMLMediaElement.volume is read-only, writes are dropped.
      },
    }
    expect(detectVolumeControl(() => probe)).toBe(false)
  })

  it('reports no support when probing throws', () => {
    expect(
      detectVolumeControl(() => {
        throw new Error('no DOM')
      }),
    ).toBe(false)
  })

  it('restores the original volume on the probe element', () => {
    const probe = { volume: 0.3 }
    detectVolumeControl(() => probe)
    expect(probe.volume).toBe(0.3)
  })
})
