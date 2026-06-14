'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createStoreSchema, type CreateStoreInput, updateStoreSchema, type UpdateStoreInput } from './schemas'

const API = process.env.API_URL ?? 'http://localhost:8080'

async function parseProblemDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? 'Ocurrió un error inesperado'
  } catch {
    return 'Ocurrió un error inesperado'
  }
}

export type UploadLogoResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function uploadStoreLogo(formData: FormData): Promise<UploadLogoResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  const file = formData.get('file') as File | null
  if (!file) return { ok: false, error: 'No se seleccionó ningún archivo' }

  const outbound = new FormData()
  outbound.append('file', file)
  outbound.append('context', 'store-logo')

  let res: Response
  try {
    res = await fetch(`${API}/api/media/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: outbound,
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = await res.json()
  return { ok: true, url: data.url as string }
}

export type StoreResponse = {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  active: boolean
  suspended: boolean
  temporarilyClosed: boolean
  createdAt: string
}

export type CreateStoreResult =
  | { ok: true; store: StoreResponse }
  | { ok: false; error: string }

export async function createStore(payload: CreateStoreInput): Promise<CreateStoreResult> {
  const parsed = createStoreSchema.safeParse(payload)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  let res: Response
  try {
    res = await fetch(`${API}/api/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const store = await res.json()
  return { ok: true, store: store as StoreResponse }
}

export type UpdateStoreResult =
  | { ok: true; store: StoreResponse }
  | { ok: false; error: string }

export async function updateStore(input: UpdateStoreInput): Promise<UpdateStoreResult> {
  const parsed = updateStoreSchema.safeParse(input)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  let res: Response
  try {
    res = await fetch(`${API}/api/stores/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
    })
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const store = await res.json()
  return { ok: true, store: store as StoreResponse }
}

export async function setStoreActive(active: boolean): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  // Reactivate: POST /me/reactivate — Deactivate permanently: DELETE /me
  const endpoint = `${API}/api/stores/me${active ? '/reactivate' : ''}`

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: active ? 'POST' : 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
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

export async function closeStoreTemporarily(): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/stores/me/close`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    revalidatePath('/store')
    revalidatePath('/store/manage')
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export async function reopenStore(): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/stores/me/reopen`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    revalidatePath('/store')
    revalidatePath('/store/manage')
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}
