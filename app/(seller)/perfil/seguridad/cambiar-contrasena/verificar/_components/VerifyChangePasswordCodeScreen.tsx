'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { OtpFormBase } from '@/app/(auth)/_components/OtpFormBase'
import { PasswordChangeProgress } from '../../_components/PasswordChangeProgress'
import { verifyChangePasswordOtp } from '@/lib/profileActions'
import type { VerificationChannel } from '@/lib/actions'

type Props = {
  pendingToken: string
  channel: VerificationChannel
}

function VerifyChangePasswordCodeContent({ pendingToken, channel }: Props) {
  const router = useRouter()

  const handleVerify = useCallback(async (code: string) => {
    const result = await verifyChangePasswordOtp(pendingToken, code)
    if (!result.ok) return false
    router.push(`/perfil/seguridad/cambiar-contrasena/nueva?token=${encodeURIComponent(result.changePasswordToken)}`)
    return true
  }, [pendingToken, router])

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      <PasswordChangeProgress step={2} />
      <OtpFormBase
        pendingToken={pendingToken}
        channel={channel}
        heading={<>Verificá <em>tu código</em></>}
        onVerify={handleVerify}
      />
    </div>
  )
}

export function VerifyChangePasswordCodeScreen({ pendingToken, channel }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/perfil/seguridad/cambiar-contrasena" className="store-back-btn" aria-label="Volver">
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
          <VerifyChangePasswordCodeContent pendingToken={pendingToken} channel={channel} />
        </div>

        <SellerBottomNav active="perfil" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/perfil/seguridad/cambiar-contrasena"
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
            <VerifyChangePasswordCodeContent pendingToken={pendingToken} channel={channel} />
          </div>
        </div>
      </div>
    </>
  )
}
