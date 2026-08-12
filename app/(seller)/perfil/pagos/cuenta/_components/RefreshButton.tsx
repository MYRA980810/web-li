'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3.4h-3.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function RefreshButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    router.refresh()
  }

  return (
    <button type="button" className="account-refresh-btn" onClick={handleClick} disabled={loading}>
      <RefreshIcon />
      {loading ? 'Actualizando...' : 'Actualizar'}
    </button>
  )
}
