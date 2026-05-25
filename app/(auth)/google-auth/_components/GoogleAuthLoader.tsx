'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function GoogleAuthLoader() {
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
    <div className="verify-loader" role="status" aria-label="Conectando con Google">
      <div className="verify-ring-wrap">
        <div className="verify-ring-glow" aria-hidden />
        <div className="verify-ring-track" aria-hidden />
        <div className="verify-spinner" aria-hidden />
        <div className="verify-ring-inner">
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
        </div>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="display" style={{ fontSize: 36, lineHeight: 1.1 }}>
          Conectando con<br /><em>Google…</em>
        </h2>
        <p className="lead" style={{ fontSize: 15 }}>
          Esto solo tomará un momento
        </p>
      </div>

      <div className="verify-progress-dash" aria-hidden />

      <div className="verify-steps" aria-hidden>
        <span className={`verify-step${step >= 1 ? ' active' : ''}`}>
          Autenticando cuenta
        </span>
        <div className={`verify-step-line${step >= 2 ? ' active' : ''}`} />
        <span className={`verify-step${step >= 2 ? ' active' : ''}`}>
          Sincronizando perfil
        </span>
      </div>
    </div>,
    document.body,
  )
}
