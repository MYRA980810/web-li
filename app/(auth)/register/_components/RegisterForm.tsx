'use client'

import { useState } from 'react'
import Link from 'next/link'

type UserType = 'seller' | 'client'

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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
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

export function RegisterForm() {
  const [role, setRole] = useState<UserType>('client')
  const [show, setShow] = useState(false)

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

      <div className="field reveal d4">
        <label className="label">Contraseña</label>
        <div className="input-wrap">
          <span className="icon">🔒</span>
          <input
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
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

      <button className="btn-pill reveal d4" style={{ width: '100%' }}>
        Crear cuenta <span aria-hidden>→</span>
      </button>

      <div className="divider reveal d5">o continúa con</div>

      <div className="oauth-row reveal d5">
        <button type="button" className="oauth-btn">
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
