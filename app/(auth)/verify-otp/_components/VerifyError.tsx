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
      {/* Error ring — reutiliza la estructura del loader con variante error */}
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

      {/* Branding */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: 14,
          letterSpacing: '0.18em',
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
        }}
      >
        Livento
      </span>

      {/* Copy */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="display" style={{ fontSize: 38, lineHeight: 1 }}>
          ¡Código<br /><em>incorrecto!</em>
        </h2>
        <p className="lead" style={{ fontSize: 15, maxWidth: 300, margin: '0 auto' }}>
          El código ingresado no es válido o ha expirado. Por favor, verificá e intentá de nuevo.
        </p>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16, padding: '0 24px' }}>
        <button
          type="button"
          className="btn-pill"
          style={{ width: '100%' }}
          onClick={onRetry}
        >
          Volver a intentar <span aria-hidden>→</span>
        </button>

        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-3)' }}>
          ¿Necesitas ayuda?{' '}
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--brand-400)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Contactar soporte
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
