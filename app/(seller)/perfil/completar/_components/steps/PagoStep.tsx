'use client'

import { useEffect, useState } from 'react'
import {
  getPayoutStatus,
  createPayoutOnboardingLink,
  createEmbeddedOnboardingSession,
  type PayoutStatus,
} from '@/lib/profileActions'
import { EmbeddedPayoutOnboarding } from './EmbeddedPayoutOnboarding'

export type PagoStepProps = {
  onNext: () => void
  retry?: boolean
}

type Mode = 'idle' | 'embedded' | 'linking'

export function PagoStep({ onNext, retry = false }: PagoStepProps) {
  const [status, setStatus] = useState<PayoutStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [mode, setMode] = useState<Mode>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getPayoutStatus().then((result) => {
      if (!active) return
      setStatus(result)
      setChecking(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function fallbackToLink() {
    setMode('linking')
    const result = await createPayoutOnboardingLink()
    if (!result.ok) {
      setMode('idle')
      setError(result.error)
      return
    }
    window.location.href = result.url
  }

  async function handleConnect() {
    setError(null)
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
    if (!publishableKey) {
      await fallbackToLink()
      return
    }
    setMode('embedded')
  }

  async function handleFetchClientSecret(): Promise<string> {
    const result = await createEmbeddedOnboardingSession()
    if (!result.ok) throw new Error(result.error)
    return result.clientSecret
  }

  async function handleFallback(reason: string) {
    console.warn('[PagoStep] embedded onboarding fallback:', reason)
    await fallbackToLink()
  }

  async function handleExit() {
    setMode('idle')
    setChecking(true)
    const result = await getPayoutStatus()
    setStatus(result)
    setChecking(false)
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-3 py-14">
        <span className="text-[13px] text-(--ink-3)">Verificando estado de pagos...</span>
      </div>
    )
  }

  const isConnected = !!status?.payoutsEnabled && !!status?.detailsSubmitted

  if (isConnected) {
    return (
      <div className="flex flex-col gap-6">
        <div className="wizard-step-card">
          <span className="text-[11px] font-extrabold tracking-[0.10em] uppercase text-brand-400 flex items-center gap-1.5">
            ✓ Cuenta Conectada
          </span>
          <p className="text-[13px] text-(--ink-2) leading-relaxed">
            Cuenta de pagos conectada. Ya podés recibir el dinero de tus ventas.
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="live-launch-btn w-full justify-center text-[14px]"
        >
          Continuar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="wizard-step-card">
        <span className="text-[11px] font-extrabold tracking-[0.10em] uppercase text-brand-400 flex items-center gap-1.5">
          💳 Conectar Pagos
        </span>
        <p className="text-[13px] text-(--ink-2) leading-relaxed">
          Conectá tu cuenta de pagos con Stripe para poder recibir el dinero de tus ventas.
          Te vamos a redirigir a Stripe para verificar tu identidad.
        </p>
        {retry && (
          <p className="text-[12px] text-brand-400">
            La conexión no se completó, intentá de nuevo.
          </p>
        )}
      </div>

      {error && <p className="text-[12px] text-brand-400">{error}</p>}

      {mode === 'embedded' ? (
        <EmbeddedPayoutOnboarding
          fetchClientSecret={handleFetchClientSecret}
          onExit={handleExit}
          onFallback={handleFallback}
        />
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={mode === 'linking'}
          className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {mode === 'linking' ? 'Redirigiendo...' : 'Conectar con Stripe'}
        </button>
      )}
    </div>
  )
}
