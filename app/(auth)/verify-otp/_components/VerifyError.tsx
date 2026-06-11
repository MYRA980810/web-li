'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  onRetry: () => void
}

export function VerifyError({ onRetry }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <div className="verify-loader" role="alert" aria-label="Error de verificación">
      <div className="verify-ring-wrap">
        <div className="verify-ring-glow error" aria-hidden />
        <div className="verify-ring-track error" aria-hidden />
        <div className="verify-ring-inner error">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
            <path
              d="M7 7L19 19M19 7L7 19"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <span className="font-display font-extrabold italic text-[14px] tracking-[0.18em] uppercase text-(--ink-3)">
        Livento
      </span>

      <div className="text-center flex flex-col gap-2.5">
        <h2 className="display text-[38px] leading-none">
          ¡Código<br /><em>incorrecto!</em>
        </h2>
        <p className="lead text-[15px] max-w-[300px] mx-auto">
          El código ingresado no es válido o ha expirado. Por favor, verificá e intentá de nuevo.
        </p>
      </div>

      <div className="w-full max-w-[360px] flex flex-col gap-4 px-6">
        <button type="button" className="btn-pill w-full" onClick={onRetry}>
          Volver a intentar <span aria-hidden>→</span>
        </button>

        <div className="text-center text-[14px] text-(--ink-3)">
          ¿Necesitas ayuda?{' '}
          <button
            type="button"
            className="text-brand-400 font-bold text-[14px] underline"
          >
            Contactar soporte
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
