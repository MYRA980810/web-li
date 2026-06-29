'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { Ambient } from '@/components/Ambient'
import { startLive, endLive, type LiveResponse } from '@/lib/liveActions'
import { SellerLiveBroadcast } from './SellerLiveBroadcast'

type Phase = 'countdown' | 'publishing' | 'live' | 'error'
type CameraState = 'connecting' | 'ready' | 'error'

type AgoraTracks = {
  client: IAgoraRTCClient
  video: ICameraVideoTrack
  audio: IMicrophoneAudioTrack
}

type Props = { liveId: string }

export function GoLiveCountdownScreen({ liveId }: Props) {
  const router = useRouter()

  const rtcUid = useRef<number>(
    Math.floor(Math.random() * 4294967294) + 1,
  )

  const [count, setCount]               = useState(3)
  const [phase, setPhase]               = useState<Phase>('countdown')
  const [live, setLive]                 = useState<LiveResponse | null>(null)
  const [cameraState, setCameraState]   = useState<CameraState>('connecting')
  const [fatalError, setFatalError]     = useState<string | null>(null)
  // Store video track in state so the play effect runs after the DOM update
  const [videoTrack, setVideoTrack]     = useState<ICameraVideoTrack | null>(null)

  const startedRef  = useRef(false)
  const endingRef   = useRef(false)
  const tracksRef   = useRef<AgoraTracks | null>(null)
  const videoRef    = useRef<HTMLDivElement>(null)

  // ── 1. Call startLive once ────────────────────────────────────────────────────
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    startLive(liveId, String(rtcUid.current)).then((result) => {
      if (result.ok) setLive(result.live)
      else { setFatalError(result.error); setPhase('error') }
    })
  }, [liveId])

  // ── 2. Join Agora + create tracks (no play() here) ───────────────────────────
  useEffect(() => {
    if (!live?.agoraChannelId || !live?.streamToken) return

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? ''
    if (!appId) { setCameraState('error'); return }

    let cancelled = false

    ;(async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
        AgoraRTC.setLogLevel(3)

        const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
        await client.setClientRole('host')
        await client.join(appId, live.agoraChannelId!, live.streamToken!, rtcUid.current)

        const [video, audio] = await Promise.all([
          AgoraRTC.createCameraVideoTrack(),
          AgoraRTC.createMicrophoneAudioTrack(),
        ])

        if (cancelled) {
          video.close(); audio.close(); await client.leave(); return
        }

        tracksRef.current = { client, video, audio }

        // Set state — triggers re-render first (overlay removed), then effect #3 plays video
        setCameraState('ready')
        setVideoTrack(video)
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[Agora] setup error:', err)
        setCameraState('error')
        if (msg.includes('PERMISSION_DENIED') || msg.includes('NotAllowedError')) {
          setFatalError('Permiso denegado. Habilitá cámara y micrófono en Configuración del Sistema → Privacidad.')
        }
      }
    })()

    return () => {
      cancelled = true
      if (tracksRef.current) {
        const { client, video, audio } = tracksRef.current
        video.stop(); video.close()
        audio.stop(); audio.close()
        void client.leave()
        tracksRef.current = null
      }
    }
  }, [live?.agoraChannelId, live?.streamToken])

  // ── 3. Play video AFTER React commits the DOM with cameraState='ready' ────────
  useEffect(() => {
    if (!videoTrack) return
    // Use string ID — more reliable than ref when element dimensions are dynamic
    videoTrack.play('agora-local-video', { fit: 'cover' })
  }, [videoTrack])

  // ── 4. Countdown tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return

    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }

    setPhase('publishing')
    void (async () => {
      const tracks = tracksRef.current
      if (tracks) {
        try { await tracks.client.publish([tracks.video, tracks.audio]) }
        catch (err) { console.error('[Agora] publish error:', err) }
      }
      setPhase('live')
    })()
  }, [count, phase])

  // ── End live ─────────────────────────────────────────────────────────────────
  async function handleEnd() {
    if (endingRef.current) return
    endingRef.current = true

    const tracks = tracksRef.current
    if (tracks) {
      tracks.video.stop(); tracks.video.close()
      tracks.audio.stop(); tracks.audio.close()
      await tracks.client.leave()
      tracksRef.current = null
    }

    if (live) await endLive(live.id)
    router.push('/home')
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  // ── Transition to live broadcast view ───────────────────────────────────────
  if (phase === 'live' && live) {
    return (
      <SellerLiveBroadcast
        live={live}
        videoTrack={videoTrack}
        storeName={live.title}
        onEnd={handleEnd}
      />
    )
  }

  const cameraLabel =
    cameraState === 'connecting' ? 'Conectando Cámara'
    : cameraState === 'error'   ? 'Error de cámara'
    :                              'Cámara lista'

  const inner = (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="font-display font-extrabold italic text-brand-500 text-[22px] leading-none [text-shadow:0_0_20px_rgba(255,31,135,0.5)]">
          Livento
        </span>
        <button className="store-back-btn text-[20px]" onClick={() => router.push('/home')} aria-label="Cerrar">
          ✕
        </button>
      </div>

      <div className="live-countdown-wrap">
        <span className="live-countdown-label">
          {phase === 'countdown'  && 'Iniciando Transmisión'}
          {phase === 'publishing' && 'Publicando stream...'}
          {phase === 'live'       && 'En Vivo'}
          {phase === 'error'      && 'Error'}
        </span>

        <div className="live-countdown-frame">
          {phase === 'countdown'  && <span className="live-countdown-number" key={count}>{count}</span>}
          {phase === 'publishing' && <span className="live-countdown-number" key="0">0</span>}
          {phase === 'live'       && <span className="live-countdown-live-badge" key="live">🔴</span>}
          {phase === 'error'      && <span className="live-countdown-live-badge" key="err">⚠️</span>}
        </div>

        <p className="live-countdown-message">
          {(phase === 'error' || cameraState === 'error') && fatalError
            ? fatalError
            : 'Prepárate, tu audiencia ya está esperando por ti.'}
        </p>

        {/* Camera preview card */}
        <div className="live-camera-card">
          <div className="live-camera-badge">
            <span className="live-camera-badge-dot"
              style={{ background: cameraState === 'ready' ? '#22c55e' : '#f59e0b' }}
            />
            {cameraState === 'ready' ? 'LIVE' : 'PREP'}
          </div>

          {/* Fixed pixel height — Agora needs non-zero dimensions on the target element */}
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
            {/* id used by videoTrack.play() — always in DOM, never conditional */}
            <div
              id="agora-local-video"
              ref={videoRef}
              style={{ width: '100%', height: '200px', background: '#111' }}
            />

            {cameraState !== 'ready' && (
              <div className="live-camera-connecting">
                <div className="live-camera-dots">
                  <span className="live-camera-dot" style={{ animationDelay: '0s' }} />
                  <span className="live-camera-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="live-camera-dot" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="live-camera-label">{cameraLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Ambient />
      <div className="lg:hidden stage screen-enter flex flex-col">{inner}</div>
      <div className="hidden lg:flex stage screen-enter flex-col items-center">
        <div className="w-full max-w-sm">{inner}</div>
      </div>
    </>
  )
}
