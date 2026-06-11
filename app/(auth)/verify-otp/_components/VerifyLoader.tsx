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
      <div className="verify-ring-wrap">
        <div className="verify-ring-glow" aria-hidden />
        <div className="verify-ring-track" aria-hidden />
        <div className="verify-spinner" aria-hidden />
        <div className="verify-ring-inner">
          <span aria-hidden className="text-[26px] leading-none">🔐</span>
        </div>
      </div>

      <div className="text-center flex flex-col gap-2.5">
        <h2 className="display text-[36px] leading-[1.1]">
          Verificando tu<br /><em>código…</em>
        </h2>
        <p className="lead text-[15px]">
          Esto solo tomará un momento
        </p>
      </div>

      <div className="verify-progress-dash" aria-hidden />

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
