'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { PasswordField } from '@/app/(auth)/_components/PasswordField'
import { PasswordChangeProgress } from '../../_components/PasswordChangeProgress'
import { changePassword } from '@/lib/profileActions'
import { changePasswordSchema } from '@/lib/schemas'

type Props = {
  changePasswordToken: string
}

function NewPasswordChangeContent({ changePasswordToken }: Props) {
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)
    const parsed = changePasswordSchema.safeParse({ changePasswordToken, newPassword, confirmPassword })
    if (!parsed.success) {
      const flat  = parsed.error.flatten()
      const first = Object.values(flat.fieldErrors).flat()[0] ?? flat.formErrors[0]
      setError(first ?? 'Revisá los campos')
      return
    }
    setLoading(true)
    const result = await changePassword(parsed.data)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push('/perfil/seguridad')
  }

  return (
    <div className="flex flex-col gap-6 w-full items-center text-center">
      <PasswordChangeProgress step={3} />

      <div className="reveal d2">
        <p className="eyebrow mb-4">Seguridad</p>
        <h2 className="display text-[30px] leading-none">
          Nueva <em>contraseña</em>
        </h2>
        <p className="lead mt-3.5 text-[15px]">
          Elegí una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <PasswordField
        className="reveal d3 w-full text-left"
        autoComplete="new-password"
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
      />

      <PasswordField
        className="reveal d4 w-full text-left"
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
        className="btn-pill reveal d5 w-full"
      >
        {loading ? 'Guardando…' : 'Guardar contraseña'} <span aria-hidden>→</span>
      </button>
    </div>
  )
}

export function NewPasswordChangeScreen({ changePasswordToken }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/perfil/seguridad" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Seguridad</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Cambiar Contraseña
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-8 pb-2">
          <NewPasswordChangeContent changePasswordToken={changePasswordToken} />
        </div>

        <SellerBottomNav active="perfil" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/perfil/seguridad"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Seguridad</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Cambiar Contraseña
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <NewPasswordChangeContent changePasswordToken={changePasswordToken} />
          </div>
        </div>
      </div>
    </>
  )
}
