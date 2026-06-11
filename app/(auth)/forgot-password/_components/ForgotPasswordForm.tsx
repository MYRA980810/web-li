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
    <div className="flex flex-col gap-5 w-full">
      <div className="reveal d1">
        <p className="eyebrow mb-4">Seguridad</p>
        <h2 className="display text-[38px] leading-none">
          Recuperá <em>tu contraseña</em>
        </h2>
        <p className="lead mt-3.5 text-[15px]">
          Ingresá tu email o teléfono y te enviaremos un código de verificación.
        </p>
      </div>

      <IdentifierField value={contact} onChange={setContact} className="reveal d2" />

      {error && (
        <p className="text-[13px] text-red-400 -mt-1">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d3 w-full mt-2"
      >
        {loading ? 'Enviando…' : 'Enviar código'} <span aria-hidden>→</span>
      </button>
    </div>
  )
}
