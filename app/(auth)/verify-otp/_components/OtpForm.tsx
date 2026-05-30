'use client'

import { useCallback } from 'react'
import { OtpFormBase } from '@/app/(auth)/_components/OtpFormBase'
import { VerifySuccess } from './VerifySuccess'
import { verifyOtp } from '@/lib/actions'
import type { VerificationChannel } from '@/lib/actions'

type OtpFormProps = {
  pendingToken: string
  channel: VerificationChannel
}

export function OtpForm({ pendingToken, channel }: OtpFormProps) {
  const handleVerify = useCallback(async (code: string) => {
    const result = await verifyOtp(pendingToken, code)
    return result.ok
  }, [pendingToken])

  return (
    <OtpFormBase
      pendingToken={pendingToken}
      channel={channel}
      heading={<>Verificá <em>tu cuenta</em></>}
      onVerify={handleVerify}
      successOverlay={<VerifySuccess />}
    />
  )
}
