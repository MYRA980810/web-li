'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleIcon } from '../../_components/auth-icons'
import { PasswordField } from '../../_components/PasswordField'

type UserType = 'seller' | 'client'

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
    </svg>
  )
}

export function RegisterForm() {
  const [role, setRole] = useState<UserType>('client')
  const router = useRouter()

  return (
    <div className="auth-form">
      <div className="reveal d1">
        <h2 className="display" style={{ fontSize: 38, lineHeight: 1 }}>
          Crea <em>tu cuenta</em>
        </h2>
        <p className="lead" style={{ marginTop: 12, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          Únete a la energía en vivo
        </p>
      </div>

      <div className="reveal d2" style={{ display: 'flex', gap: 12 }}>
        {(['seller', 'client'] as UserType[]).map((type) => (
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

      <div className="field reveal d3">
        <label className="label">Nombre completo</label>
        <div className="input-wrap">
          <span className="icon">👤</span>
          <input placeholder="Ej: Alex Rivera" autoComplete="name" />
        </div>
      </div>

      <div className="field reveal d3">
        <label className="label">Correo o teléfono</label>
        <div className="input-wrap">
          <span className="icon">@</span>
          <input placeholder="alex@ejemplo.com" autoComplete="email" />
        </div>
      </div>

      <PasswordField className="reveal d4" autoComplete="new-password" />

      <button className="btn-pill reveal d4" style={{ width: '100%' }}>
        Crear cuenta <span aria-hidden>→</span>
      </button>

      <div className="divider reveal d5">o continúa con</div>

      <div className="oauth-row reveal d5">
        <button type="button" className="oauth-btn" onClick={() => router.push('/google-auth')}>
          <span className="oauth-icon" style={{ background: 'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)', color: '#fff' }}>
            <GoogleIcon />
          </span>
          Google
        </button>
        <button type="button" className="oauth-btn">
          <span className="oauth-icon" style={{ background: '#fff', color: '#000' }}>
            <AppleIcon />
          </span>
          Apple
        </button>
      </div>

      <div className="reveal d5" style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--brand-400)', fontWeight: 700, textDecoration: 'underline' }}
        >
          Inicia sesión
        </Link>
      </div>
    </div>
  )
}
