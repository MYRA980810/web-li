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

        <div className="flex flex-col gap-2.5">
          <h2 className="display text-[32px] leading-[1.05]">
            ¡Cuenta<br /><em>verificada!</em>
          </h2>
          <p className="lead text-[15px]">
            Tu identidad ha sido confirmada. Ya podés acceder a tu cuenta.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link href="/" className="btn-pill w-full no-underline">
            Ir al inicio <span aria-hidden>→</span>
          </Link>
          <Link href="/login" className="btn-ghost w-full no-underline text-[14px]">
            Volver al login
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  )
}
