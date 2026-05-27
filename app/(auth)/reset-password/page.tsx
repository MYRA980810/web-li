import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from './_components/ResetPasswordForm'
import { BrandSidePanel } from '../_components/BrandSidePanel'

export const metadata: Metadata = {
  title: 'Nueva contraseña — Livento',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/forgot-password')

  return (
    <>
      {/* Desktop */}
      <div className="auth-desktop screen-enter">
        <BrandSidePanel variant="login" />
        <div className="auth-form-card glass" style={{ borderRadius: 32 }}>
          <ResetPasswordForm resetToken={token} />
        </div>
      </div>

      {/* Mobile */}
      <div className="auth-mobile screen-enter">
        <div className="splash-mobile-inner" style={{ paddingTop: 24, justifyContent: 'flex-start', gap: 24 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/login"
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
          <ResetPasswordForm resetToken={token} />
        </div>
      </div>
    </>
  )
}
