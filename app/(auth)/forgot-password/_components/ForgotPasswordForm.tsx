'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IdentifierField } from '../../_components/IdentifierField'
import { forgotPassword } from '@/lib/actions'
import { forgotPasswordSchema } from '@/lib/schemas'

export function ForgotPasswordForm() {
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)
    const parsed = forgotPasswordSchema.safeParse({ contact })
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      setError(first ?? 'Revisá los campos')
      return
    }
    setLoading(true)
    const result = await forgotPassword(parsed.data)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push(`/verify-reset-code?token=${encodeURIComponent(result.pendingToken)}&channel=${result.channel}`)
  }

  return (
    <div className="auth-form">
      <div className="reveal d1">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Seguridad</p>
        <h2 className="display" style={{ fontSize: 38, lineHeight: 1 }}>
          Recuperá <em>tu contraseña</em>
        </h2>
        <p className="lead" style={{ marginTop: 14, fontSize: 15 }}>
          Ingresá tu email o teléfono y te enviaremos un código de verificación.
        </p>
      </div>

      <IdentifierField
        value={contact}
        onChange={setContact}
        className="reveal d2"
      />

      {error && (
        <p style={{ fontSize: 13, color: 'var(--error, #ef4444)', marginTop: -4 }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d3"
        style={{ width: '100%', marginTop: 8 }}
      >
        {loading ? 'Enviando…' : 'Enviar código'} <span aria-hidden>→</span>
      </button>
    </div>
  )
}
