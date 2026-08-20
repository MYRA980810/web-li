'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { PasswordField } from '@/app/(auth)/_components/PasswordField'
import { PasswordChangeProgress } from './PasswordChangeProgress'
import { verifyCurrentPassword } from '@/lib/profileActions'
import { verifyCurrentPasswordSchema } from '@/lib/schemas'

function VerifyCurrentPasswordContent() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)
    const parsed = verifyCurrentPasswordSchema.safeParse({ currentPassword })
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      setError(first ?? 'Ingresá tu contraseña actual')
      return
    }
    setLoading(true)
    const result = await verifyCurrentPassword(parsed.data.currentPassword)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push(
      `/perfil/seguridad/cambiar-contrasena/verificar?token=${encodeURIComponent(result.pendingToken)}&channel=${result.channel}`,
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full items-center text-center">
      <PasswordChangeProgress step={1} />

      <div className="reveal d2">
        <p className="eyebrow mb-4">Seguridad</p>
        <h2 className="display text-[30px] leading-none">
          Confirmá <em>tu identidad</em>
        </h2>
        <p className="lead mt-3.5 text-[15px]">
          Ingresá tu contraseña actual para continuar con el cambio.
        </p>
      </div>

      <PasswordField
        className="reveal d3 w-full text-left"
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
      />

      {error && (
        <p className="text-[13px] text-red-400 -mt-1">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d4 w-full"
      >
        {loading ? 'Verificando…' : 'Continuar'} <span aria-hidden>→</span>
      </button>

      <Link
        href="/forgot-password"
        className="reveal d5 text-[14px] font-bold text-brand-400 inline-flex items-center gap-1.5"
      >
        Olvidé mi contraseña <span aria-hidden>→</span>
      </Link>

      <p className="reveal d5 text-[11px] text-(--ink-3) inline-flex items-center gap-1.5 max-w-xs">
        <span aria-hidden>ⓘ</span> Te enviaremos un código de verificación para confirmar el cambio.
      </p>
    </div>
  )
}

export function VerifyCurrentPasswordScreen() {
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
          <VerifyCurrentPasswordContent />
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
            <VerifyCurrentPasswordContent />
          </div>
        </div>
      </div>
    </>
  )
}
