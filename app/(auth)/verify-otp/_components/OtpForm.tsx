'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { VerifyLoader } from './VerifyLoader'
import { VerifySuccess } from './VerifySuccess'
import { VerifyError } from './VerifyError'

const OTP_LENGTH = 6
const RESEND_SECONDS = 59

type Status = 'idle' | 'verifying' | 'success' | 'error'

export function OtpForm() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const refs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null))

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  function handleChange(i: number, val: string) {
    const ch = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = ch
    setDigits(next)
    if (ch && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  function handleResend() {
    setSeconds(RESEND_SECONDS)
    setCanResend(false)
    setDigits(Array(OTP_LENGTH).fill(''))
    refs.current[0]?.focus()
  }

  const handleVerify = useCallback(() => {
    if (!digits.every(d => d !== '')) return
    setStatus('verifying')
    // Replace with real API call — "111111" simulates an error for testing
    setTimeout(() => {
      setStatus(digits.join('') === '111111' ? 'error' : 'success')
    }, 3000)
  }, [digits])

  function handleRetry() {
    setStatus('idle')
    setDigits(Array(OTP_LENGTH).fill(''))
    setTimeout(() => refs.current[0]?.focus(), 50)
  }

  const isComplete = digits.every(d => d !== '')
  const timer = `0:${String(seconds).padStart(2, '0')}`

  return (
    <>
      {status === 'verifying' && <VerifyLoader />}
      {status === 'success'   && <VerifySuccess />}
      {status === 'error'     && <VerifyError onRetry={handleRetry} />}

      <div
        className="auth-form"
        style={{ alignItems: 'center', textAlign: 'center', maxWidth: 400 }}
      >
        <div className="reveal d1">
          <p className="eyebrow" style={{ marginBottom: 16 }}>Seguridad</p>
          <h2 className="display" style={{ fontSize: 38, lineHeight: 1 }}>
            Verifica <em>tu cuenta</em>
          </h2>
          <p className="lead" style={{ marginTop: 14, fontSize: 15 }}>
            Ingresa el código de 6 dígitos enviado a tu correo o teléfono.
          </p>
        </div>

        <div className="otp-row reveal d2" role="group" aria-label="Código de verificación">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              className={`otp-box${d ? ' filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              autoComplete="one-time-code"
              aria-label={`Dígito ${i + 1} de ${OTP_LENGTH}`}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn-pill reveal d3"
          style={{ width: '100%' }}
          disabled={!isComplete}
          aria-disabled={!isComplete}
          onClick={handleVerify}
        >
          Verificar Código <span aria-hidden>→</span>
        </button>

        <div
          className="reveal d4"
          style={{ fontSize: 14, color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <span>¿No recibiste el código?</span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              style={{ fontSize: 14, color: 'var(--brand-400)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Reenviar código
            </button>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
              <span aria-hidden style={{ fontSize: 15 }}>⏱</span>
              Reenviar en {timer}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
