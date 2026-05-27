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
      <div className="auth-desktop screen-enter">
        <BrandSidePanel variant="login" />
        <div className="auth-form-card glass" style={{ borderRadius: 32 }}>
          <VerifyResetCodeForm pendingToken={token} channel={verificationChannel} />
        </div>
      </div>

      {/* Mobile */}
      <div className="auth-mobile screen-enter">
        <div className="splash-mobile-inner" style={{ paddingTop: 24, justifyContent: 'flex-start', gap: 32 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/forgot-password"
              className="btn-circle ghost"
              style={{ width: 40, height: 40, fontSize: 18, textDecoration: 'none' }}
              aria-label="Atrás"
            >
              ←
            </Link>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-500)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Livento
            </span>
            <div style={{ width: 40 }} />
          </div>
          <VerifyResetCodeForm pendingToken={token} channel={verificationChannel} />
        </div>
      </div>
    </>
  )
}
