'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppleIcon, GoogleIcon } from '../../_components/auth-icons'
import { PasswordField } from '../../_components/PasswordField'
import { IdentifierField } from '../../_components/IdentifierField'
import { loginUser } from '@/lib/actions'
import { loginSchema } from '@/lib/schemas'

export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)
    const parsed = loginSchema.safeParse({ contact: identifier, password })
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      setError(first ?? 'Revisá los campos')
      return
    }
    setLoading(true)
    const result = await loginUser(parsed.data)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    router.push('/')
  }

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

      <IdentifierField
        value={identifier}
        onChange={setIdentifier}
        className="reveal d3"
      />

      <PasswordField
        className="reveal d4"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      <Link
        href="/forgot-password"
        className="reveal d4"
        style={{ fontSize: 13, color: 'var(--brand-400)', alignSelf: 'flex-end', marginTop: -8 }}
      >
        Forgot password?
      </Link>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--error, #ef4444)', marginTop: -4 }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d4"
        style={{ width: '100%', marginTop: 8 }}
      >
        {loading ? 'Iniciando sesión…' : 'Continuar'} <span aria-hidden>→</span>
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
