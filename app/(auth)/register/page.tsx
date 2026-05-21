import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './_components/RegisterForm'
import { BrandSidePanel } from '../_components/BrandSidePanel'

export const metadata: Metadata = {
  title: 'Crear cuenta — Livento',
}

export default function RegisterPage() {
  return (
    <>
      {/* Desktop */}
      <div className="auth-desktop screen-enter">
        <BrandSidePanel variant="register" />
        <div className="auth-form-card glass" style={{ borderRadius: 32 }}>
          <RegisterForm />
        </div>
      </div>

      {/* Mobile */}
      <div className="auth-mobile screen-enter">
        <div className="splash-mobile-inner" style={{ paddingTop: 24, justifyContent: 'flex-start', gap: 20 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/onboarding"
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
          <RegisterForm />
        </div>
      </div>
    </>
  )
}
