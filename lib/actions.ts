'use server'

import { cookies } from 'next/headers'
import { registerSchema, verifyOtpSchema, loginSchema, type LoginInput } from './schemas'

const API = process.env.API_URL ?? 'http://localhost:8080'

type VerificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP'

export type RegisterResult =
  | { ok: true; pendingToken: string; channel: VerificationChannel }
  | { ok: false; error: string }

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

async function parseProblemDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? 'Ocurrió un error inesperado'
  } catch {
    return 'Ocurrió un error inesperado'
  }
}

export async function registerUser(payload: {
  contact: string
  password: string
  firstName: string
  lastName: string
  role: 'SELLER' | 'BUYER'
}): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(payload)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  let res: Response
  try {
    res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact:   parsed.data.contact,
        password:  parsed.data.password,
        firstName: parsed.data.firstName,
        lastName:  parsed.data.lastName,
        role:      parsed.data.role,
      }),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, pendingToken: data.pendingToken, channel: data.channel }
}

export async function verifyOtp(
  pendingToken: string,
  code: string,
): Promise<ActionResult> {
  const parsed = verifyOtpSchema.safeParse({ pendingToken, code })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Código inválido' }
  }

  let res: Response
  try {
    res = await fetch(`${API}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingToken, code }),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  const cookieStore = await cookies()
  cookieStore.set('session', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { ok: true }
}

export async function loginUser(payload: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(payload)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  let res: Response
  try {
    res = await fetch(`${API}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ contact: parsed.data.contact, password: parsed.data.password }),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  const cookieStore = await cookies()
  cookieStore.set('session', data.accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  })

  return { ok: true }
}

export async function resendOtp(pendingToken: string): Promise<ActionResult> {
  let res: Response
  try {
    res = await fetch(`${API}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingToken }),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  return { ok: true }
}
