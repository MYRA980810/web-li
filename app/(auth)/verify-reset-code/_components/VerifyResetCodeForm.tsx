'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { OtpFormBase } from '@/app/(auth)/_components/OtpFormBase'
import { verifyResetCode } from '@/lib/actions'
import type { VerificationChannel } from '@/lib/actions'

type Props = {
  pendingToken: string
  channel: VerificationChannel
}

export function VerifyResetCodeForm({ pendingToken, channel }: Props) {
  const router = useRouter()

  const handleVerify = useCallback(async (code: string) => {
    const result = await verifyResetCode({ pendingToken, code })
    if (!result.ok) return false
    router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`)
    return true
  }, [pendingToken, router])

  return (
    <OtpFormBase
      pendingToken={pendingToken}
      channel={channel}
      heading={<>Verificá <em>tu código</em></>}
      onVerify={handleVerify}
    />
  )
}
