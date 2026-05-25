'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppleIcon, GoogleIcon } from '../../_components/auth-icons'
import { PasswordField } from '../../_components/PasswordField'

type Tab = 'email' | 'phone'

export function LoginForm() {
  const [tab, setTab] = useState<Tab>('email')
  const router = useRouter()

  return (
    <div className="auth-form">
      <div className="reveal d1">
        <h2 className="display" style={{ fontSize: 38, marginTop: 0, lineHeight: 1 }}>
          Bienvenido <em>de nuevo</em>
        </h2>
        <p className="lead" style={{ marginTop: 12, fontSize: 15 }}>
          Inicia sesión para volver al live.
        </p>
      </div>

      <button
        className="oauth-btn reveal d2"
        style={{ width: '100%', padding: '16px 20px' }}
        onClick={() => router.push('/google-auth')}
      >
        <span
          className="oauth-icon"
          style={{ background: 'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)', color: '#fff' }}
        >
          <GoogleIcon />
        </span>
        Continuar con Google
      </button>

      <button className="oauth-btn reveal d2" style={{ width: '100%', padding: '16px 20px' }}>
        <span
          className="oauth-icon"
          style={{ background: '#fff', color: '#000' }}
        >
          <AppleIcon />
        </span>
        Continuar con Apple
      </button>

      <div className="divider reveal d2">o entra con</div>

      <div className="tab-row reveal d3">
        <button
          type="button"
          className={`tab-btn${tab === 'email' ? ' active' : ''}`}
          onClick={() => setTab('email')}
        >
          Email
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'phone' ? ' active' : ''}`}
          onClick={() => setTab('phone')}
        >
          Teléfono
        </button>
      </div>

      <div className="field reveal d3">
        <label className="label">{tab === 'email' ? 'Email' : 'Teléfono'}</label>
        <div className="input-wrap">
          <span className="icon">{tab === 'email' ? '@' : '☎'}</span>
          <input
            type={tab === 'email' ? 'email' : 'tel'}
            placeholder={tab === 'email' ? 'myramex23@gmail.com' : '+52 55 1234 5678'}
            autoComplete={tab === 'email' ? 'email' : 'tel'}
          />
        </div>
      </div>

      <PasswordField className="reveal d4" autoComplete="current-password" />

      <button className="btn-pill reveal d4" style={{ width: '100%', marginTop: 8 }}>
        Continuar <span aria-hidden>→</span>
      </button>

      <div className="reveal d5" style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-2)', marginTop: 4 }}>
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          style={{ color: 'var(--brand-400)', fontWeight: 700, textDecoration: 'underline' }}
        >
          Regístrate
        </Link>
      </div>
    </div>
  )
}
