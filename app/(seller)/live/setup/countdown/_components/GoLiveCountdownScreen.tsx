'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng'
import type { AmazonIVSBroadcastClient } from 'amazon-ivs-web-broadcast'
import { Ambient } from '@/components/Ambient'
import { startLive, endLive, type LiveResponse, type LiveBroadcastResponse } from '@/lib/liveActions'
import { SellerLiveBroadcast } from './SellerLiveBroadcast'
import { LiveFinishedDrawer } from './LiveFinishedDrawer'
import { GuidesGeneratingScreen } from './GuidesGeneratingScreen'
import { GuidesReadyScreen } from './GuidesReadyScreen'
import type { ProductView, Category } from '@/lib/types'

type Phase = 'countdown' | 'publishing' | 'live' | 'finished' | 'generating-guides' | 'guides-ready' | 'error'
type CameraState = 'connecting' | 'ready' | 'error'

type BroadcastHandle =
  | { provider: 'ivs'; client: AmazonIVSBroadcastClient; streamKey: string }
  | { provider: 'agora'; client: IAgoraRTCClient; video: ILocalVideoTrack; audio: ILocalAudioTrack }

type Props = {
  liveId: string
  products: ProductView[]
  categories: Category[]
}

export function GoLiveCountdownScreen({ liveId, products, categories }: Props) {
  const router = useRouter()

  const rtcUid = useRef<number>(
    Math.floor(Math.random() * 4294967294) + 1,
  )

  const [count, setCount]               = useState(3)
  const [phase, setPhase]               = useState<Phase>('countdown')
  const [broadcast, setBroadcast]       = useState<LiveBroadcastResponse | null>(null)
  const [live, setLive]                 = useState<LiveResponse | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [cameraState, setCameraState]   = useState<CameraState>('connecting')
  const [fatalError, setFatalError]     = useState<string | null>(null)
  // Store the raw camera stream in state so the srcObject effect runs after the DOM update
  const [mediaStream, setMediaStream]   = useState<MediaStream | null>(null)

  const startedRef     = useRef(false)
  const endingRef       = useRef(false)
  const publishedRef    = useRef(false)
  const handleRef       = useRef<BroadcastHandle | null>(null)
  const mediaStreamRef  = useRef<MediaStream | null>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)

  // ── 1. Call startLive once ────────────────────────────────────────────────────
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    startLive(liveId, String(rtcUid.current)).then((result) => {
      if (result.ok) { setBroadcast(result.broadcast); setLive(result.broadcast.live) }
      else { setFatalError(result.error); setPhase('error') }
    })
  }, [liveId])

  // ── 2. Get camera/mic once, then wire the active video provider ──────────────
  useEffect(() => {
    if (!broadcast) return

    let cancelled = false

    ;(async () => {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: true,
        })
      } catch (err) {
        if (cancelled) return
        const name = err instanceof DOMException ? err.name : ''
        const msg  = err instanceof Error ? err.message : String(err)
        console.error('[Camera] getUserMedia error:', err)
        setCameraState('error')
        if (name === 'NotAllowedError' || msg.includes('PERMISSION_DENIED') || msg.includes('NotAllowedError')) {
          setFatalError('Permiso denegado. Habilitá cámara y micrófono en Configuración del Sistema → Privacidad.')
        }
        return
      }

      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }

      try {
        if (broadcast.ivsIngestEndpoint && broadcast.ivsStreamKeyValue) {
          const { create, STANDARD_LANDSCAPE } = await import('amazon-ivs-web-broadcast')
          const client = create({ ingestEndpoint: broadcast.ivsIngestEndpoint, streamConfig: STANDARD_LANDSCAPE })
          await client.addVideoInputDevice(stream, 'camera', { index: 0 })
          await client.addAudioInputDevice(stream, 'mic')

          if (cancelled) {
            client.delete()
            stream.getTracks().forEach((t) => t.stop())
            return
          }

          handleRef.current = { provider: 'ivs', client, streamKey: broadcast.ivsStreamKeyValue }
        } else if (broadcast.streamToken) {
          const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? ''
          if (!appId) {
            setCameraState('error')
            stream.getTracks().forEach((t) => t.stop())
            return
          }

          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
          AgoraRTC.setLogLevel(3)

          const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
          await client.setClientRole('host')
          await client.join(appId, broadcast.live.agoraChannelId!, broadcast.streamToken, rtcUid.current)

          const video = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })
          const audio = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: stream.getAudioTracks()[0] })

          if (cancelled) {
            video.close(); audio.close()
            void client.leave()
            stream.getTracks().forEach((t) => t.stop())
            return
          }

          handleRef.current = { provider: 'agora', client, video, audio }
        } else {
          setCameraState('error')
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        mediaStreamRef.current = stream

        // Set state — triggers re-render first (overlay removed), then effect #3 assigns srcObject
        setCameraState('ready')
        setMediaStream(stream)
      } catch (err) {
        if (cancelled) return
        console.error('[Broadcast] setup error:', err)
        setCameraState('error')
        stream.getTracks().forEach((t) => t.stop())
      }
    })()

    return () => {
      cancelled = true

      const stream = mediaStreamRef.current
      if (stream) stream.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null

      const handle = handleRef.current
      if (handle) {
        if (handle.provider === 'ivs') {
          handle.client.stopBroadcast()
          handle.client.delete()
        } else {
          handle.video.stop(); handle.video.close()
          handle.audio.stop(); handle.audio.close()
          void handle.client.leave()
        }
        handleRef.current = null
      }
    }
  }, [broadcast])

  // ── 3. Assign srcObject AFTER React commits the DOM with cameraState='ready' ──
  useEffect(() => {
    if (!mediaStream || !videoRef.current) return
    videoRef.current.srcObject = mediaStream
  }, [mediaStream])

  // ── 4. Countdown tick — purely visual, does not gate publishing ───────────────
  useEffect(() => {
    if (phase !== 'countdown') return

    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }

    setPhase('publishing')
  }, [count, phase])

  // ── 5. Publish once the countdown is done AND the camera is actually ready ────
  // If the camera setup (effect #2) is still running when the countdown hits 0,
  // this waits — the UI shows "Conectando cámara..." — instead of cutting to a
  // black live screen with nothing published to viewers.
  useEffect(() => {
    if (phase !== 'publishing' || publishedRef.current) return
    if (cameraState !== 'ready') return

    publishedRef.current = true
    void (async () => {
      const handle = handleRef.current
      if (handle?.provider === 'ivs') {
        try { await handle.client.startBroadcast(handle.streamKey) }
        catch (err) { console.error('[IVS] startBroadcast error:', err) }
      } else if (handle?.provider === 'agora') {
        try { await handle.client.publish([handle.video, handle.audio]) }
        catch (err) { console.error('[Agora] publish error:', err) }
      }
      setPhase('live')
    })()
  }, [phase, cameraState])

  // ── End live ─────────────────────────────────────────────────────────────────
  async function handleEnd() {
    if (endingRef.current) return
    endingRef.current = true

    const stream = mediaStreamRef.current
    if (stream) stream.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null

    const handle = handleRef.current
    if (handle) {
      if (handle.provider === 'ivs') {
        handle.client.stopBroadcast()
        handle.client.delete()
      } else {
        handle.video.stop(); handle.video.close()
        handle.audio.stop(); handle.audio.close()
        await handle.client.leave()
      }
      handleRef.current = null
    }

    if (!live) { router.push('/home'); return }

    const result = await endLive(live.id)
    if (result.ok) setLive(result.live)
    setPhase('finished')
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  // ── Post-live summary — orders ready for shipping ─────────────────────────────
  if (phase === 'finished' && live) {
    return (
      <>
        <Ambient />
        <LiveFinishedDrawer
          live={live}
          onGenerateLabels={(orderIds) => {
            setSelectedOrderIds(orderIds)
            setPhase('generating-guides')
          }}
          onReviewOrders={() => router.push('/home')}
        />
      </>
    )
  }

  // ── Generating shipping guides — mock progress, no tracking backend yet ───────
  if (phase === 'generating-guides') {
    return <GuidesGeneratingScreen onComplete={() => setPhase('guides-ready')} />
  }

  // ── Shipping guides ready — mock confirmation summary ─────────────────────────
  if (phase === 'guides-ready') {
    return (
      <GuidesReadyScreen
        orderCount={selectedOrderIds.length}
        onDownloadPdf={() => router.push('/home')}
        onGoToShipments={() => router.push('/home')}
      />
    )
  }

  // ── Transition to live broadcast view ───────────────────────────────────────
  if (phase === 'live' && live) {
    return (
      <SellerLiveBroadcast
        live={live}
        stream={mediaStream}
        storeName={live.title}
        onEnd={handleEnd}
        products={products}
        categories={categories}
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
          {phase === 'publishing' && (cameraState === 'ready' ? 'Publicando stream...' : 'Conectando cámara...')}
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

          {/* Fixed pixel height — the preview element needs non-zero dimensions */}
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
            {/* always in DOM, never conditional — srcObject is assigned once the stream is ready */}
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              style={{ width: '100%', height: '200px', background: '#111', objectFit: 'cover' }}
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
