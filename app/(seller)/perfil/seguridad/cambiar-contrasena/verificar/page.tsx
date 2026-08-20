import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { VerifyChangePasswordCodeScreen } from './_components/VerifyChangePasswordCodeScreen'

export const metadata: Metadata = {
  title: 'Verificar código — Livento',
}

type VerificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP'

export default async function VerifyChangePasswordCodePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; channel?: string }>
}) {
  const { token, channel } = await searchParams

  if (!token) redirect('/perfil/seguridad/cambiar-contrasena')

  const verificationChannel: VerificationChannel =
    channel === 'SMS' || channel === 'WHATSAPP' ? channel : 'EMAIL'

  return <VerifyChangePasswordCodeScreen pendingToken={token} channel={verificationChannel} />
}
