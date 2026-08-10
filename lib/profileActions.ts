'use server'

import { addSellerAddressSchema, type AddSellerAddressInput } from './schemas'
import { API, parseProblemDetail, requireToken, isNextInternalError, fetchWithAuth } from './fetchWithAuth'

export type UserProfile = {
  id: string
  email: string | null
  phone: string | null
  role: 'SELLER' | 'BUYER'
  firstName: string
  lastName: string
  alias: string | null
  avatarUrl: string | null
  profileComplete: boolean
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const token = await requireToken()
  const res = await fetchWithAuth(`${API}/api/auth/me`, { headers: {} }, token)
  if (!res.ok) return null
  return res.json() as Promise<UserProfile>
}

export type UploadAvatarResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function uploadProfileAvatar(formData: FormData): Promise<UploadAvatarResult> {
  const token = await requireToken()

  const file = formData.get('file') as File | null
  if (!file) return { ok: false, error: 'No se seleccionó ningún archivo' }

  const outbound = new FormData()
  outbound.append('file', file)
  outbound.append('context', 'profile-avatar')

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/media/images`, {
      method: 'POST',
      body: outbound,
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, url: data.url as string }
}

export type UpdateAvatarResult =
  | { ok: true; avatarUrl: string }
  | { ok: false; error: string }

export async function updateAvatar(avatarUrl: string): Promise<UpdateAvatarResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/auth/me/avatar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, avatarUrl: data.avatarUrl as string }
}

export type UpdateAliasResult =
  | { ok: true; alias: string }
  | { ok: false; error: string }

export async function updateAlias(alias: string): Promise<UpdateAliasResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/auth/me/alias`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, alias: data.alias as string }
}

export type PayoutStatus = {
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  connected: boolean
}

export async function getPayoutStatus(): Promise<PayoutStatus | null> {
  const token = await requireToken()
  const res = await fetchWithAuth(`${API}/api/seller/payout-account/status`, { headers: {} }, token)
  if (!res.ok) return null
  return res.json() as Promise<PayoutStatus>
}

export type CreatePayoutOnboardingLinkResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function createPayoutOnboardingLink(): Promise<CreatePayoutOnboardingLinkResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/seller/payout-account/onboarding-link`, {
      method: 'POST',
      headers: {},
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, url: data.url as string }
}

export type CreateEmbeddedOnboardingSessionResult =
  | { ok: true; clientSecret: string }
  | { ok: false; error: string }

export async function createEmbeddedOnboardingSession(): Promise<CreateEmbeddedOnboardingSessionResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/seller/payout-account/embedded-onboarding-session`, {
      method: 'POST',
      headers: {},
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, clientSecret: data.clientSecret as string }
}

export type AddSellerAddressResult =
  | { ok: true }
  | { ok: false; error: string }

export async function addSellerAddress(payload: AddSellerAddressInput): Promise<AddSellerAddressResult> {
  const parsed = addSellerAddressSchema.safeParse(payload)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/seller/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  return { ok: true }
}
