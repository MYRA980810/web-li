'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export function VerifySuccess() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <div className="verify-result-overlay">
      <div className="verify-result-card">
        {/* Icon */}
        <div className="verify-icon-circle success">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
            <path
              d="M6 16.5L12.5 23L26 9"
              stroke="url(#check-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="check-grad" x1="6" y1="16" x2="26" y2="9" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff66b8" />
                <stop offset="100%" stopColor="#ff1f87" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="display" style={{ fontSize: 32, lineHeight: 1.05 }}>
            ¡Cuenta<br /><em>verificada!</em>
          </h2>
          <p className="lead" style={{ fontSize: 15 }}>
            Tu identidad ha sido confirmada. Ya podés acceder a tu cuenta.
          </p>
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/"
            className="btn-pill"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            Ir al inicio <span aria-hidden>→</span>
          </Link>
          <Link
            href="/login"
            className="btn-ghost"
            style={{ width: '100%', textDecoration: 'none', fontSize: 14 }}
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  )
}
