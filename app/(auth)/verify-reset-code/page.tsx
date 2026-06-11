import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { VerifyResetCodeForm } from './_components/VerifyResetCodeForm'
import { BrandSidePanel } from '../_components/BrandSidePanel'

export const metadata: Metadata = {
  title: 'Verificar código — Livento',
}

type VerificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP'

export default async function VerifyResetCodePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; channel?: string }>
}) {
  const { token, channel } = await searchParams

  if (!token) redirect('/forgot-password')

  const verificationChannel: VerificationChannel =
    channel === 'SMS' || channel === 'WHATSAPP' ? channel : 'EMAIL'

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen screen-enter">
        <BrandSidePanel variant="login" />
        <div className="flex flex-col justify-center p-10 overflow-y-auto glass rounded-[32px]">
          <VerifyResetCodeForm pendingToken={token} channel={verificationChannel} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen screen-enter">
        <div className="flex flex-col items-center min-h-screen px-6 pt-6 pb-10 gap-8">
          <div className="w-full flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="btn-circle ghost no-underline"
              style={{ width: 40, height: 40, fontSize: 18 }}
              aria-label="Atrás"
            >
              ←
            </Link>
            <span className="font-display text-brand-500 font-bold tracking-[-0.02em]">Livento</span>
            <div className="w-10" />
          </div>
          <VerifyResetCodeForm pendingToken={token} channel={verificationChannel} />
        </div>
      </div>
    </>
  )
}
