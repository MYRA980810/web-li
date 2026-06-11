'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PasswordField } from '../../_components/PasswordField'
import { resetPassword } from '@/lib/actions'
import { resetPasswordSchema } from '@/lib/schemas'

type Props = {
  resetToken: string
}

export function ResetPasswordForm({ resetToken }: Props) {
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)
    const parsed = resetPasswordSchema.safeParse({ resetToken, newPassword, confirmPassword })
    if (!parsed.success) {
      const flat  = parsed.error.flatten()
      const first = Object.values(flat.fieldErrors).flat()[0] ?? flat.formErrors[0]
      setError(first ?? 'Revisá los campos')
      return
    }
    setLoading(true)
    const result = await resetPassword(parsed.data)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push('/')
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="reveal d1">
        <p className="eyebrow mb-4">Seguridad</p>
        <h2 className="display text-[38px] leading-none">
          Nueva <em>contraseña</em>
        </h2>
        <p className="lead mt-3.5 text-[15px]">
          Elegí una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <PasswordField
        className="reveal d2"
        autoComplete="new-password"
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
      />

      <PasswordField
        className="reveal d3"
        autoComplete="new-password"
        label="Confirmar contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      {error && (
        <p className="text-[13px] text-red-400 -mt-1">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d4 w-full mt-2"
      >
        {loading ? 'Guardando…' : 'Guardar contraseña'} <span aria-hidden>→</span>
      </button>
    </div>
  )
}
