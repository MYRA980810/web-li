'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tab = 'email' | 'phone'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export function LoginForm() {
  const [tab, setTab] = useState<Tab>('email')
  const [show, setShow] = useState(false)

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

      <button className="oauth-btn reveal d2" style={{ width: '100%', padding: '16px 20px' }}>
        <span
          className="oauth-icon"
          style={{ background: 'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)', color: '#fff' }}
        >
          <GoogleIcon />
        </span>
        Continuar con Google
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

      <div className="field reveal d4">
        <label className="label">Contraseña</label>
        <div className="input-wrap">
          <span className="icon">🔒</span>
          <input
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{ color: 'var(--ink-3)', fontSize: 14, display: 'flex', alignItems: 'center' }}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

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
