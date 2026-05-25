'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthLoader } from './GoogleAuthLoader'

const MOCK_ACCOUNTS = [
  { id: '1', name: 'Juan Pérez', email: 'juan.perez@gmail.com', initial: 'J', alt: false },
  { id: '2', name: 'Elena Rossi', email: 'elena.rossi@gmail.com', initial: 'E', alt: true },
]

function ChevronRight() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--ink-3)', flexShrink: 0 }}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function AddUserIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--ink-2)' }}
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

export function GoogleAccountPicker() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSelect() {
    setLoading(true)
    setTimeout(() => {
      router.push('/select-role')
    }, 2800)
  }

  return (
    <>
      {loading && <GoogleAuthLoader />}

      <div className="auth-form">
        <div className="google-picker-header reveal d1">
          <div className="google-picker-icon">
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <h2 className="display" style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 6 }}>
              Elige una cuenta
            </h2>
            <p className="lead" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              para continuar con Livento
            </p>
          </div>
        </div>

        <div className="reveal d2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              className="google-account-item"
              onClick={handleSelect}
            >
              <div className={`google-account-avatar${account.alt ? ' alt' : ''}`}>
                {account.initial}
              </div>
              <div className="google-account-info">
                <span className="google-account-name">{account.name}</span>
                <span className="google-account-email">{account.email}</span>
              </div>
              <ChevronRight />
            </button>
          ))}

          <button
            type="button"
            className="google-account-item"
            onClick={handleSelect}
          >
            <div
              className="google-account-avatar"
              style={{ background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <AddUserIcon />
            </div>
            <div className="google-account-info">
              <span className="google-account-name">Usar otra cuenta</span>
            </div>
            <ChevronRight />
          </button>
        </div>

        <div className="reveal d3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="google-picker-footer">
            Al continuar, Google compartirá tu nombre, correo, preferencia de idioma y foto de perfil con Livento. Consultá la{' '}
            <a href="#" style={{ color: 'var(--brand-400)', textDecoration: 'underline' }}>política de privacidad</a>
            {' '}y los{' '}
            <a href="#" style={{ color: 'var(--brand-400)', textDecoration: 'underline' }}>términos de servicio</a>
            {' '}de Livento.
          </p>
          <div className="google-picker-links">
            <a href="#">Ayuda</a>
            <span style={{ color: 'var(--line-strong)' }}>·</span>
            <a href="#">Privacidad</a>
            <span style={{ color: 'var(--line-strong)' }}>·</span>
            <a href="#">Términos</a>
          </div>
        </div>
      </div>
    </>
  )
}
