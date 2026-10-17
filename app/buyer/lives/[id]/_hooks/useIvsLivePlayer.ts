'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { MediaPlayer } from 'amazon-ivs-player'
import {
  DEFAULT_VOLUME,
  VOLUME_STORAGE_KEY,
  clampVolume,
  detectVolumeControl,
  mutedAfterVolumeChange,
  parseStoredVolume,
  volumeForUnmute,
} from '../_lib/liveAudio'
import { isRetryablePlaybackError, nextRetryDelay } from '../_lib/playbackRetry'

const noopSubscribe = () => () => {}

// The probe result never changes for a given browser, so compute it once.
let volumeControlSupport: boolean | null = null
function getVolumeControlSupport(): boolean {
  if (volumeControlSupport === null) {
    volumeControlSupport = detectVolumeControl(() => document.createElement('video'))
  }
  return volumeControlSupport
}

function readStoredVolume(): number | null {
  try {
    return parseStoredVolume(localStorage.getItem(VOLUME_STORAGE_KEY))
  } catch {
    return null
  }
}

function storeVolume(volume: number): void {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
  } catch {
    // Private mode / blocked storage — the preference just isn't remembered.
  }
}

export type IvsLivePlayer = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** Unrecoverable: retries exhausted, non-retryable error, or no SDK support. */
  playbackError: boolean
  /** A fatal player error is being recovered with backoff. */
  reconnecting: boolean
  muted: boolean
  volume: number
  /** False on iOS Safari, where media volume is hardware-only. */
  volumeAdjustable: boolean
  /** The browser refused unmuted playback; a tap is needed to get sound. */
  audioBlocked: boolean
  /** The browser refused autoplay entirely; a tap is needed to start. */
  playbackBlocked: boolean
  toggleMute: () => void
  changeVolume: (volume: number) => void
  resumeAudio: () => void
  resumePlayback: () => void
  /** Manual retry after playbackError: resets the backoff and recreates the player. */
  retry: () => void
}

/**
 * Owns the Amazon IVS player for one playback URL. Always starts muted
 * (autoplay policy); audio changes only happen from user-gesture handlers,
 * which call the player synchronously so Safari treats them as gestures.
 * The player is created once per URL (plus once per recovery attempt after a
 * fatal error) — mute/volume never recreate it. The <video> must stay
 * mounted while reconnecting so a recreated player can attach to it.
 */
export function useIvsLivePlayer(playbackUrl: string | null): IvsLivePlayer {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<MediaPlayer | null>(null)
  const [playbackError, setPlaybackError] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  // Bumped to recreate the player (auto-retry or manual retry).
  const [generation, setGeneration] = useState(0)
  const attemptRef = useRef(0)
  const attemptUrlRef = useRef<string | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  // Read inside the async player-creation effect so a mute/volume change made
  // before the player finishes loading isn't clobbered by a stale value.
  const mutedRef = useRef(true)
  const volumeRef = useRef(DEFAULT_VOLUME)
  const volumeTouchedRef = useRef(false)

  const volumeAdjustable = useSyncExternalStore(noopSubscribe, getVolumeControlSupport, () => false)

  // Dynamically imported — the WASM player SDK only loads for viewers actually
  // watching a live stream, not on every visit to this route.
  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return
    let cancelled = false
    // A new URL starts with a fresh retry budget.
    if (attemptUrlRef.current !== playbackUrl) {
      attemptUrlRef.current = playbackUrl
      attemptRef.current = 0
    }

    void (async () => {
      const { create, isPlayerSupported, PlayerEventType, PlayerState } = await import('amazon-ivs-player')
      if (cancelled || !videoRef.current) return
      if (!isPlayerSupported) {
        setReconnecting(false)
        setPlaybackError(true)
        return
      }

      const player = create({
        wasmWorker: '/ivs-player/amazon-ivs-wasmworker.min.js',
        wasmBinary: '/ivs-player/amazon-ivs-wasmworker.min.wasm',
      })
      playerRef.current = player
      player.attachHTMLVideoElement(videoRef.current)

      // ERROR is fatal (player goes IDLE). Dispose this instance right away so
      // it never leaks, then either schedule a recreation with backoff
      // (transient network/timeout/404 while still on air) or give up.
      player.addEventListener(PlayerEventType.ERROR, (error) => {
        player.delete()
        if (playerRef.current === player) playerRef.current = null
        if (cancelled) return

        const delay = isRetryablePlaybackError(error.type) ? nextRetryDelay(attemptRef.current) : null
        if (delay === null) {
          setReconnecting(false)
          setPlaybackError(true)
          return
        }
        setReconnecting(true)
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null
          attemptRef.current += 1
          setGeneration((g) => g + 1)
        }, delay)
      })
      // Unmuted playback refused without a gesture: keep the stream going
      // muted and surface a "tap for sound" affordance instead of failing.
      player.addEventListener(PlayerEventType.AUDIO_BLOCKED, () => {
        mutedRef.current = true
        player.setMuted(true)
        player.play()
        setMuted(true)
        setAudioBlocked(true)
      })
      player.addEventListener(PlayerEventType.PLAYBACK_BLOCKED, () => setPlaybackBlocked(true))
      player.addEventListener(PlayerState.PLAYING, () => {
        // Healthy again: the next failure gets a full retry budget.
        attemptRef.current = 0
        setReconnecting(false)
        setPlaybackBlocked(false)
      })

      // Restore the remembered volume level only — never auto-unmute.
      if (!volumeTouchedRef.current) {
        const stored = readStoredVolume()
        if (stored !== null) {
          volumeRef.current = stored
          setVolume(stored)
        }
      }

      player.setVolume(volumeRef.current)
      player.setMuted(mutedRef.current)
      player.setAutoplay(true)
      player.load(playbackUrl)
      player.play()
    })()

    return () => {
      cancelled = true
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      playerRef.current?.delete()
      playerRef.current = null
    }
  }, [playbackUrl, generation])

  const applyAudio = useCallback((nextMuted: boolean, nextVolume: number) => {
    mutedRef.current = nextMuted
    volumeRef.current = nextVolume
    setMuted(nextMuted)
    setVolume(nextVolume)
    setAudioBlocked(false)
    const player = playerRef.current
    if (!player) return
    player.setVolume(nextVolume)
    player.setMuted(nextMuted)
    // Some browsers pause when unmuting; resuming inside the gesture is safe.
    if (!nextMuted) player.play()
  }, [])

  const toggleMute = useCallback(() => {
    const nextMuted = !mutedRef.current
    applyAudio(nextMuted, nextMuted ? volumeRef.current : volumeForUnmute(volumeRef.current))
  }, [applyAudio])

  const changeVolume = useCallback(
    (requested: number) => {
      const next = clampVolume(requested)
      volumeTouchedRef.current = true
      storeVolume(next)
      applyAudio(mutedAfterVolumeChange(next), next)
    },
    [applyAudio],
  )

  const resumeAudio = useCallback(() => {
    applyAudio(false, volumeForUnmute(volumeRef.current))
  }, [applyAudio])

  const retry = useCallback(() => {
    attemptRef.current = 0
    setPlaybackError(false)
    setReconnecting(true)
    setGeneration((g) => g + 1)
  }, [])

  const resumePlayback = useCallback(() => {
    setPlaybackBlocked(false)
    playerRef.current?.play()
  }, [])

  return {
    videoRef,
    playbackError,
    reconnecting,
    muted,
    volume,
    volumeAdjustable,
    audioBlocked,
    playbackBlocked,
    toggleMute,
    changeVolume,
    resumeAudio,
    resumePlayback,
    retry,
  }
}
