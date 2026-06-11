'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppleIcon, GoogleIcon } from '../../_components/auth-icons'
import { PasswordField } from '../../_components/PasswordField'
import { IdentifierField } from '../../_components/IdentifierField'
import { loginUser } from '@/lib/actions'
import { loginSchema } from '@/lib/schemas'

type Props = {
  oauthError?: string
}

const OAUTH_ERRORS: Record<string, string> = {
  email_conflict: 'Este email ya está registrado con otro método. Iniciá sesión con tu contraseña.',
  oauth: 'Ocurrió un error al autenticar con Google. Intentá de nuevo.',
}

export function LoginForm({ oauthError }: Props) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(
    oauthError ? (OAUTH_ERRORS[oauthError] ?? 'Ocurrió un error al autenticar con Google.') : null
  )
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
    <div className="flex flex-col gap-5 w-full">
      <div className="reveal d1">
        <h2 className="display text-[38px] mt-0 leading-none">
          Bienvenido <em>de nuevo</em>
        </h2>
        <p className="lead mt-3 text-[15px]">
          Inicia sesión para volver al live.
        </p>
      </div>

      <button
        className="oauth-btn reveal d2"
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

      <button className="oauth-btn reveal d2">
        <span className="oauth-icon" style={{ background: '#fff', color: '#000' }}>
          <AppleIcon />
        </span>
        Continuar con Apple
      </button>

      <div className="divider reveal d2">o entra con</div>

      <IdentifierField value={identifier} onChange={setIdentifier} className="reveal d3" />

      <PasswordField
        className="reveal d4"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      <Link
        href="/forgot-password"
        className="reveal d4 self-end text-[13px] text-brand-400 no-underline"
      >
        Forgot password?
      </Link>

      {error && (
        <p className="text-[13px] text-red-400 -mt-1">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-pill reveal d4 w-full mt-2"
      >
        {loading ? 'Iniciando sesión…' : 'Continuar'} <span aria-hidden>→</span>
      </button>

      <div className="reveal d5 text-center text-[14px] text-(--ink-2) mt-1">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-400 font-bold underline">
          Regístrate
        </Link>
      </div>
    </div>
  )
}
