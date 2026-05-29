'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeGoogleAuth } from '@/lib/actions'

type UserRole = 'SELLER' | 'BUYER'

type Props = {
  pendingToken?: string
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SELLER: 'Creá tu tienda, transmití en vivo y vendé tus productos a miles de personas en tiempo real.',
  BUYER: 'Explorá lives en tiempo real, descubrí productos exclusivos y comprá directamente desde el stream.',
}

export function RoleSelector({ pendingToken }: Props) {
  const router = useRouter()
  const [role, setRole]     = useState<UserRole>('BUYER')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleConfirm() {
    if (!pendingToken) { router.push('/'); return }
    setError(null)
    setLoading(true)
    const result = await completeGoogleAuth(pendingToken, role)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push('/')
  }

  return (
    <div className="auth-form">
      <div className="reveal d1">
        <h2 className="display" style={{ fontSize: 34, lineHeight: 1.1 }}>
          ¿Cómo vas a usar <em>Livento?</em>
        </h2>
        <p className="lead" style={{ marginTop: 12, fontSize: 14 }}>
          Elegí tu rol para personalizar tu experiencia.
        </p>
      </div>

      <div className="reveal d2" style={{ display: 'flex', gap: 12 }}>
        {(['SELLER', 'BUYER'] as UserRole[]).map((type) => (
          <div
            key={type}
            className={`role-card${role === type ? ' active' : ''}`}
            onClick={() => setRole(type)}
            role="button"
            tabIndex={0}
            aria-pressed={role === type}
            onKeyDown={(e) => e.key === 'Enter' && setRole(type)}
          >
            <div className="check">✓</div>
            <div className="icon-box">{type === 'SELLER' ? '🏪' : '🛍'}</div>
            <div className="card-label">{type === 'SELLER' ? 'Vendedor' : 'Comprador'}</div>
          </div>
        ))}
      </div>

      <p className="reveal d3" style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
        {ROLE_DESCRIPTIONS[role]}
      </p>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--error, #ef4444)', marginTop: -4 }}>
          {error}
        </p>
      )}

      <button
        className="btn-pill reveal d4"
        style={{ width: '100%', marginTop: 4 }}
        disabled={loading}
        onClick={handleConfirm}
      >
        {loading ? 'Configurando…' : `Continuar como ${role === 'SELLER' ? 'Vendedor' : 'Comprador'}`}{' '}
        <span aria-hidden>→</span>
      </button>
    </div>
  )
}
