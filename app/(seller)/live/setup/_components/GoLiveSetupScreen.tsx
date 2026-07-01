'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { createLive } from '@/lib/liveActions'

// Backend constraint: @Min(15) @Max(120)
const DEPLOY_STEPS = [
  { label: '15S', seconds: 15 },
  { label: '30S', seconds: 30 },
  { label: '60S', seconds: 60 },
  { label: '2M',  seconds: 120 },
]

function formatDeploy(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${seconds / 60}m`
}

type Props = { storeId: string | null }

export function GoLiveSetupScreen({ storeId }: Props) {
  const router = useRouter()

  const [title, setTitle]         = useState('')
  const [deployIdx, setDeployIdx] = useState(2)
  const [beautyAI, setBeautyAI]   = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const deploySeconds = DEPLOY_STEPS[deployIdx].seconds
  const fillPct       = (deployIdx / (DEPLOY_STEPS.length - 1)) * 100

  async function handleStart() {
    setIsLoading(true)
    setError(null)

    const result = await createLive({
      title:                  title.trim(),
      displayDurationSeconds: deploySeconds,
      context:                storeId ? 'STORE' : 'SELLER_PROFILE',
      storeId:                storeId ?? undefined,
    })

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push(`/live/setup/countdown?liveId=${result.live.id}`)
  }

  const formBody = (idSuffix: string) => (
    <>
      {/* Eyebrow + heading */}
      <div className="px-5 mt-6 reveal d1">
        <span className="eyebrow">Sesión Instantánea</span>
        <h1 className="live-setup-h1">Configuración<br />de Live</h1>
      </div>

      {/* Session title */}
      <div className="px-5 mt-7 reveal d2">
        <label className="store-form-label" htmlFor={`session-title${idSuffix}`}>
          Título de la Sesión
        </label>
        <input
          id={`session-title${idSuffix}`}
          type="text"
          className="store-input"
          placeholder="Ej. Liquidación de verano · Ropa Premium"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Deploy time slider */}
      <div className="px-5 mt-7 reveal d3">
        <div className="flex items-center justify-between mb-4">
          <span className="store-form-label" style={{ marginBottom: 0 }}>
            Tiempo de Despliegue
          </span>
          <span className="live-setup-time-value">{formatDeploy(deploySeconds)}</span>
        </div>
        <div className="live-slider-wrap">
          <input
            type="range"
            className="live-slider"
            min={0}
            max={3}
            step={1}
            value={deployIdx}
            style={{ '--live-fill': `${fillPct}%` } as React.CSSProperties}
            onChange={(e) => setDeployIdx(Number(e.target.value))}
            aria-label="Tiempo de despliegue"
            disabled={isLoading}
          />
          <div className="live-slider-ticks">
            {DEPLOY_STEPS.map((s) => (
              <span key={s.label} className="live-slider-tick">{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Product inventory */}
      <div className="px-5 mt-7 reveal d4">
        <span className="store-form-label">Inventario de Productos</span>
        <div className="live-inventory-grid">
          <button className="live-inventory-card" aria-label="Cargar desde stock" disabled={isLoading}>
            <span className="live-inventory-card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="5" rx="1"/>
                <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/>
                <path d="M9 13h6M9 16h4"/>
              </svg>
            </span>
            <span className="live-inventory-card-body">
              <span className="live-inventory-card-title">Cargar desde Stock</span>
              <span className="live-inventory-card-desc">Selecciona productos existentes de tu tienda</span>
            </span>
          </button>
          <button className="live-inventory-card" aria-label="Añadir nuevo" disabled={isLoading}>
            <span className="live-inventory-card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </span>
            <span className="live-inventory-card-body">
              <span className="live-inventory-card-title">Añadir Nuevo</span>
              <span className="live-inventory-card-desc">Carga productos manualmente si no tenés una tienda configurada</span>
            </span>
          </button>
        </div>
      </div>

      {/* Beauty AI toggle */}
      <div className="px-5 mt-5 reveal d5">
        <div className="live-toggle-row">
          <div className="flex items-center gap-3">
            <span className="live-toggle-icon">✨</span>
            <span className="live-toggle-label">Filtros de Belleza IA</span>
          </div>
          <button
            className={`live-toggle${beautyAI ? ' on' : ''}`}
            onClick={() => setBeautyAI((v) => !v)}
            role="switch"
            aria-checked={beautyAI}
            aria-label="Filtros de Belleza IA"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="px-5 mt-4">
          <p className="text-[13px] text-red-400 font-medium leading-snug">{error}</p>
        </div>
      )}

      <div className="h-36" />
    </>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">

        <div className="store-back-header">
          <button className="store-back-btn" onClick={() => router.back()} aria-label="Volver">
            ←
          </button>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            Configuración de Live
          </span>
          <button className="home-nav-icon" aria-label="Configuración">⚙️</button>
        </div>

        {formBody('-m')}

        <div className="live-setup-cta lg:hidden">
          <button
            className="live-start-btn"
            onClick={handleStart}
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? 'Creando sesión...' : '🚀 Iniciar Live Ahora'}
          </button>
        </div>

        <SellerBottomNav active="home" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:block stage screen-enter">
        <div className="max-w-lg mx-auto w-full">

          <div className="live-setup-nav">
            <button className="store-back-btn" onClick={() => router.back()} aria-label="Volver">
              ←
            </button>
            <span className="live-setup-nav-title">Go Live Setup</span>
            <button className="store-back-btn" aria-label="Configuración">⚙️</button>
          </div>

          {formBody('-d')}

          <div className="px-5 mt-6 pb-10">
            <button
              className="live-start-btn"
              onClick={handleStart}
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? 'Creando sesión...' : '🚀 Iniciar Live Ahora'}
            </button>
          </div>
        </div>

        <SellerBottomNav active="home" />
      </div>
    </>
  )
}
