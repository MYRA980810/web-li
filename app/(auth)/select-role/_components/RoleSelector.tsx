'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UserRole = 'seller' | 'client'

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  seller: 'Creá tu tienda, transmití en vivo y vendé tus productos a miles de personas en tiempo real.',
  client: 'Explorá lives en tiempo real, descubrí productos exclusivos y comprá directamente desde el stream.',
}

export function RoleSelector() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('client')

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
        {(['seller', 'client'] as UserRole[]).map((type) => (
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
            <div className="icon-box">{type === 'seller' ? '🏪' : '🛍'}</div>
            <div className="card-label">{type === 'seller' ? 'Vendedor' : 'Cliente'}</div>
          </div>
        ))}
      </div>

      <p className="reveal d3" style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
        {ROLE_DESCRIPTIONS[role]}
      </p>

      <button
        className="btn-pill reveal d4"
        style={{ width: '100%', marginTop: 4 }}
        onClick={() => router.push('/')}
      >
        Continuar como {role === 'seller' ? 'Vendedor' : 'Cliente'} <span aria-hidden>→</span>
      </button>
    </div>
  )
}
