'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { VerifyLoader } from '../verify-otp/_components/VerifyLoader'
import { VerifyError } from '../verify-otp/_components/VerifyError'
import { resendOtp } from '@/lib/actions'
import type { VerificationChannel } from '@/lib/actions'

const OTP_LENGTH = 6
const RESEND_SECONDS = 59

type Status = 'idle' | 'verifying' | 'success' | 'error'

const CHANNEL_LABEL: Record<VerificationChannel, string> = {
  EMAIL:    'correo electrónico',
  SMS:      'teléfono',
  WHATSAPP: 'WhatsApp',
}

type OtpFormBaseProps = {
  pendingToken: string
  channel: VerificationChannel
  heading: React.ReactNode
  onVerify: (code: string) => Promise<boolean>
  successOverlay?: React.ReactNode
}

export function OtpFormBase({ pendingToken, channel, heading, onVerify, successOverlay }: OtpFormBaseProps) {
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

  async function handleResend() {
    await resendOtp(pendingToken)
    setSeconds(RESEND_SECONDS)
    setCanResend(false)
    setDigits(Array(OTP_LENGTH).fill(''))
    refs.current[0]?.focus()
  }

  const handleVerify = useCallback(async () => {
    if (!digits.every(d => d !== '')) return
    setStatus('verifying')
    const ok = await onVerify(digits.join(''))
    if (!ok) { setStatus('error'); return }
    setStatus(successOverlay != null ? 'success' : 'idle')
  }, [digits, onVerify, successOverlay])

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
      {status === 'success'   && successOverlay}
      {status === 'error'     && <VerifyError onRetry={handleRetry} />}

      <div className="flex flex-col gap-5 w-full items-center text-center max-w-[400px]">
        <div className="reveal d1">
          <p className="eyebrow mb-4">Seguridad</p>
          <h2 className="display text-[38px] leading-none">
            {heading}
          </h2>
          <p className="lead mt-3.5 text-[15px]">
            Ingresá el código de 6 dígitos enviado a tu{' '}
            {CHANNEL_LABEL[channel]}.
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
          className="btn-pill reveal d3 w-full"
          disabled={!isComplete}
          aria-disabled={!isComplete}
          onClick={handleVerify}
        >
          Verificar código <span aria-hidden>→</span>
        </button>

        <div className="reveal d4 flex flex-col items-center gap-2 text-[14px] text-(--ink-3)">
          <span>¿No recibiste el código?</span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[14px] text-brand-400 font-bold underline"
            >
              Reenviar código
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-(--ink-2)">
              <span aria-hidden className="text-[15px]">⏱</span>
              Reenviar en {timer}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
