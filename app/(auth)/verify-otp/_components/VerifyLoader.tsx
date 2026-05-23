'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function VerifyLoader() {
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="verify-loader" role="status" aria-label="Verificando código">
      {/* Spinner ring */}
      <div className="verify-ring-wrap">
        <div className="verify-ring-glow" aria-hidden />
        <div className="verify-ring-track" aria-hidden />
        <div className="verify-spinner" aria-hidden />
        <div className="verify-ring-inner">
          <span aria-hidden style={{ fontSize: 26, lineHeight: 1 }}>🔐</span>
        </div>
      </div>

      {/* Copy */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="display" style={{ fontSize: 36, lineHeight: 1.1 }}>
          Verificando tu<br /><em>código…</em>
        </h2>
        <p className="lead" style={{ fontSize: 15 }}>
          Esto solo tomará un momento
        </p>
      </div>

      {/* Animated dash */}
      <div className="verify-progress-dash" aria-hidden />

      {/* Step indicators */}
      <div className="verify-steps" aria-hidden>
        <span className={`verify-step${step >= 1 ? ' active' : ''}`}>
          Securing session
        </span>
        <div className={`verify-step-line${step >= 2 ? ' active' : ''}`} />
        <span className={`verify-step${step >= 2 ? ' active' : ''}`}>
          Syncing profile
        </span>
      </div>
    </div>,
    document.body,
  )
}
