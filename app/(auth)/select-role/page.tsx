import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { RoleSelector } from './_components/RoleSelector'
import { BrandSidePanel } from '../_components/BrandSidePanel'
import { exchangeOAuthCode } from '@/lib/actions'

export const metadata: Metadata = {
  title: 'Elegí tu rol — Livento',
}

export default async function SelectRolePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  if (!code) redirect('/login')

  const pendingToken = await exchangeOAuthCode(code)
  if (!pendingToken) redirect('/login?error=oauth_failed')

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen screen-enter">
        <BrandSidePanel variant="register" />
        <div className="flex flex-col justify-center p-10 overflow-y-auto glass rounded-[32px]">
          <RoleSelector pendingToken={pendingToken} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen screen-enter">
        <div className="flex flex-col items-center min-h-screen px-6 pt-6 pb-10 gap-6">
          <div className="w-full flex items-center justify-between">
            <Link
              href="/google-auth"
              className="btn-circle ghost no-underline"
              style={{ width: 40, height: 40, fontSize: 18 }}
              aria-label="Atrás"
            >
              ←
            </Link>
            <span className="font-display text-brand-500 font-bold tracking-[-0.02em]">Livento</span>
            <div className="w-10" />
          </div>
          <RoleSelector pendingToken={pendingToken} />
        </div>
      </div>
    </>
  )
}
