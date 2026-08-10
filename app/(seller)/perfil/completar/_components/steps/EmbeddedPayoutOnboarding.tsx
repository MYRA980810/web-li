'use client'

import { useEffect, useState } from 'react'
import {
  loadConnectAndInitialize,
  type AppearanceOptions,
  type LoadError,
  type StripeConnectInstance,
} from '@stripe/connect-js'
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js'

export type EmbeddedPayoutOnboardingProps = {
  fetchClientSecret: () => Promise<string>
  onExit: () => void
  onFallback: (reason: string) => void
}

function buildAppearance(): AppearanceOptions {
  return {
    overlays: 'dialog',
    variables: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", // matches --font-body
      // Solid colors only — Stripe rejects rgba() on background-family variables. This is
      // --bg-0 (#050507) with the same rgba(255,255,255,0.03) + rgba(255,31,135,0.10) layers
      // that .wizard-step-card uses, flattened to rgb() — the app's pink-tinted glass card
      // look, not a flat black slab.
      colorBackground: '#26121c',
      colorText: '#ffffff', // --ink-0
      colorSecondaryText: 'rgba(255,255,255,0.62)', // --ink-2
      colorPrimary: '#ff1f87', // --brand-500
      colorDanger: '#ef4444', // matches .verify-spinner.error / danger-zone tokens
      colorBorder: 'rgba(255,255,255,0.14)', // --line-strong
      borderRadius: '24px', // --r-lg, capped at Stripe's 24px max

      buttonPrimaryColorBackground: '#ff1f87',
      buttonPrimaryColorBorder: '#ff1f87',
      buttonPrimaryColorText: '#1a0612', // matches .live-launch-btn / .role-card .check text
      buttonBorderRadius: '24px', // Stripe caps radius at 24px, no true pill (--r-pill) possible
      // rgba(255,255,255,0.06) flattened over colorBackground — same recipe as .btn-circle.ghost
      buttonSecondaryColorBackground: '#33202a',
      buttonSecondaryColorBorder: 'rgba(255,255,255,0.14)',
      buttonSecondaryColorText: '#ffffff',

      actionPrimaryColorText: '#ff1f87',
      actionSecondaryColorText: 'rgba(255,255,255,0.62)',

      // rgba(255,255,255,0.04) flattened over colorBackground — same recipe as .field .input-wrap
      formBackgroundColor: '#2f1b25',
      offsetBackgroundColor: '#2f1b25',
      formBorderRadius: '24px',
      formHighlightColorBorder: '#ff1f87',
      formAccentColor: '#ff1f87',
      // --ink-3 (rgba(255,255,255,0.42)) flattened over colorBackground
      formPlaceholderTextColor: '#81767b',

      overlayBorderRadius: '24px',
      overlayBackdropColor: 'rgba(5,5,7,0.72)', // --bg-0
    },
  }
}

export function EmbeddedPayoutOnboarding({ fetchClientSecret, onExit, onFallback }: EmbeddedPayoutOnboardingProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(null)

  useEffect(() => {
    if (!publishableKey) return
    // loadConnectAndInitialize invokes fetchClientSecret (a Server Action) synchronously
    // on init, which touches Next.js router state — must run post-render (here), never
    // inside useMemo/render, or React throws "Cannot update a component while rendering
    // a different component". The setState below initializes a third-party SDK instance
    // (Stripe Connect.js); there's no external subscription to attach to instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStripeConnectInstance(
      loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret,
        appearance: buildAppearance(),
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize once per mount, not per prop change
  }, [])

  if (!stripeConnectInstance) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <span className="text-[13px] text-(--ink-3)">Cargando formulario...</span>
      </div>
    )
  }

  function handleLoadError({ error }: LoadError) {
    onFallback(error.type)
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-(--r-lg)" style={{ border: '1px solid var(--line-strong)' }}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountOnboarding onExit={onExit} onLoadError={handleLoadError} />
      </ConnectComponentsProvider>
    </div>
  )
}
