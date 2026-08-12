'use client'

import { useState } from 'react'
import { createPayoutOnboardingLink } from '@/lib/profileActions'

export function ConnectAccountCta() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await createPayoutOnboardingLink()
    if (!result.ok) {
      setLoading(false)
      setError(result.error)
      return
    }
    window.location.href = result.url
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirigiendo...' : 'Conectar con Stripe'}
      </button>
      {error && <p className="text-[12px] text-brand-400">{error}</p>}
    </div>
  )
}
