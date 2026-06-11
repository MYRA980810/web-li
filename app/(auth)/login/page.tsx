import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './_components/LoginForm'
import { BrandSidePanel } from '../_components/BrandSidePanel'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Livento',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen screen-enter">
        <BrandSidePanel variant="login" />
        <div className="flex flex-col justify-center p-10 overflow-y-auto glass rounded-[32px]">
          <LoginForm oauthError={error} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen screen-enter">
        <div className="flex flex-col items-center min-h-screen px-6 pt-6 pb-10 gap-6">
          <div className="w-full flex items-center justify-between">
            <Link
              href="/onboarding"
              className="btn-circle ghost no-underline"
              style={{ width: 40, height: 40, fontSize: 18 }}
              aria-label="Atrás"
            >
              ←
            </Link>
            <span className="font-display text-brand-500 font-bold tracking-[-0.02em]">Livento</span>
            <div className="w-10" />
          </div>
          <LoginForm oauthError={error} />
        </div>
      </div>
    </>
  )
}
