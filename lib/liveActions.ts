'use server'

import { createLiveSchema, type CreateLiveInput } from './schemas'
import { API, parseProblemDetail, requireToken, isNextInternalError, fetchWithAuth } from './fetchWithAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LiveResponse = {
  id: string
  sellerId: string
  storeId: string | null
  liveContext: string
  title: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  agoraChannelId: string | null
  streamToken: string | null
  thumbnailUrl: string | null
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  peakViewers: number
  displayDurationSeconds: number
  createdAt: string
}

// ─── createLive ───────────────────────────────────────────────────────────────

export type CreateLiveResult =
  | { ok: true;  live: LiveResponse }
  | { ok: false; error: string }

export async function createLive(input: CreateLiveInput): Promise<CreateLiveResult> {
  const parsed = createLiveSchema.safeParse(input)
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context:                parsed.data.context,
        storeId:                parsed.data.storeId ?? null,
        title:                  parsed.data.title,
        displayDurationSeconds: parsed.data.displayDurationSeconds,
        ...(parsed.data.scheduledAt  ? { scheduledAt: parsed.data.scheduledAt } : {}),
        ...(parsed.data.thumbnailUrl ? { thumbnailUrl: parsed.data.thumbnailUrl } : {}),
      }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const live = await res.json()
  return { ok: true, live: live as LiveResponse }
}

// ─── uploadLiveThumbnail ────────────────────────────────────────────────────────

export type UploadLiveThumbnailResult =
  | { ok: true;  url: string }
  | { ok: false; error: string }

export async function uploadLiveThumbnail(file: File): Promise<UploadLiveThumbnailResult> {
  const token = await requireToken()

  const mediaForm = new FormData()
  mediaForm.append('files', file)
  mediaForm.append('context', 'lives')

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/media/images/batch`, {
      method: 'POST',
      body: mediaForm,
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo subir la imagen' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const media = (await res.json()) as { urls: string[] }
  const url = media.urls[0]
  if (!url) return { ok: false, error: 'No se pudo subir la imagen' }

  return { ok: true, url }
}

// ─── Live product types ───────────────────────────────────────────────────────

export type LiveProductStatus = 'AVAILABLE' | 'PINNED' | 'SOLD'

export type LiveProductApiResponse = {
  id: string
  liveId: string
  productId: string | null
  variantId: string | null
  productNameSnapshot: string
  priceSnapshot: number
  currencySnapshot: string
  stockAllocated: number
  stockSold: number
  isHot: boolean
  isPinned: boolean
  status: LiveProductStatus
  position: number
  imageUrl: string | null
}

// ─── getLiveProducts ──────────────────────────────────────────────────────────

export type GetLiveProductsResult =
  | { ok: true;  products: LiveProductApiResponse[] }
  | { ok: false; error: string }

export async function getLiveProducts(liveId: string): Promise<GetLiveProductsResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives/${liveId}/products`, { method: 'GET' }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const products = await res.json()
  return { ok: true, products: products as LiveProductApiResponse[] }
}

// ─── addHotLiveProduct ────────────────────────────────────────────────────────

export type AddHotLiveProductResult =
  | { ok: true;  product: LiveProductApiResponse }
  | { ok: false; error: string }

export async function addHotLiveProduct(
  liveId: string,
  fd: FormData,
): Promise<AddHotLiveProductResult> {
  const token = await requireToken()

  const name           = (fd.get('name') as string | null)?.trim() ?? ''
  const price          = parseFloat((fd.get('price') as string | null) ?? '0')
  const currency       = (fd.get('currency') as string | null) ?? 'MXN'
  const stockAllocated = parseInt((fd.get('stockAllocated') as string | null) ?? '1', 10)
  const imageFile      = fd.get('image') as File | null

  if (!name) return { ok: false, error: 'El nombre es requerido' }
  if (stockAllocated < 1) return { ok: false, error: 'El stock mínimo es 1' }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    const mediaForm = new FormData()
    mediaForm.append('files', imageFile)
    mediaForm.append('context', 'products')

    let mediaRes: Response
    try {
      mediaRes = await fetchWithAuth(`${API}/api/media/images/batch`, {
        method: 'POST',
        body: mediaForm,
      }, token)
    } catch (err) {
      if (isNextInternalError(err)) throw err
      return { ok: false, error: 'No se pudo subir la imagen' }
    }

    if (!mediaRes.ok) {
      const error = await parseProblemDetail(mediaRes)
      return { ok: false, error }
    }

    const media = (await mediaRes.json()) as { urls: string[] }
    imageUrl = media.urls[0] ?? null
  }

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives/${liveId}/products/hot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, currency, stockAllocated, imageUrl }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const product = await res.json()
  return { ok: true, product: product as LiveProductApiResponse }
}

// ─── pinLiveProduct ───────────────────────────────────────────────────────────

export type PinLiveProductResult =
  | { ok: true;  product: LiveProductApiResponse }
  | { ok: false; error: string }

export async function pinLiveProduct(
  liveId: string,
  productId: string,
): Promise<PinLiveProductResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/lives/${liveId}/products/${productId}/pin`,
      { method: 'POST' },
      token,
    )
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const product = await res.json()
  return { ok: true, product: product as LiveProductApiResponse }
}

// ─── expirePinLiveProduct ───────────────────────────────────────────────────────

export type ExpirePinLiveProductResult =
  | { ok: true;  product: LiveProductApiResponse }
  | { ok: false; error: string }

export async function expirePinLiveProduct(
  liveId: string,
  productId: string,
): Promise<ExpirePinLiveProductResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/lives/${liveId}/products/${productId}/expire-pin`,
      { method: 'POST' },
      token,
    )
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const product = await res.json()
  return { ok: true, product: product as LiveProductApiResponse }
}

// ─── endLive ──────────────────────────────────────────────────────────────────

export type EndLiveResult =
  | { ok: true;  live: LiveResponse }
  | { ok: false; error: string }

export async function endLive(liveId: string): Promise<EndLiveResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives/${liveId}/end`, {
      method: 'POST',
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const live = await res.json()
  return { ok: true, live: live as LiveResponse }
}

// ─── getChatToken ─────────────────────────────────────────────────────────────

export type ChatTokenData = {
  token: string
  channelName: string
  appId: string
  rtmUid: string
}

export type GetChatTokenResult =
  | { ok: true;  data: ChatTokenData }
  | { ok: false; error: string }

function extractSubFromJwt(jwt: string): string | null {
  try {
    const part = jwt.split('.')[1]
    if (!part) return null
    const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
    return (payload.sub as string) ?? null
  } catch {
    return null
  }
}

export async function getChatToken(liveId: string): Promise<GetChatTokenResult> {
  const token  = await requireToken()
  const rtmUid = extractSubFromJwt(token)
  if (!rtmUid) return { ok: false, error: 'No se pudo obtener la identidad del usuario' }

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives/${liveId}/rtm/token`, { method: 'GET' }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const data = (await res.json()) as { token: string; channelName: string; appId: string }
  return { ok: true, data: { ...data, rtmUid } }
}

// ─── getChatHistory ───────────────────────────────────────────────────────────

export type ChatHistoryMessage = {
  id: string
  userId: string
  username: string
  content: string
  sentAt: string
}

export type GetChatHistoryResult =
  | { ok: true;  messages: ChatHistoryMessage[] }
  | { ok: false; error: string }

export async function getChatHistory(liveId: string, limit = 50, before?: string): Promise<GetChatHistoryResult> {
  const token = await requireToken()

  const params = new URLSearchParams({ limit: String(limit) })
  if (before) params.set('before', before)

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/lives/${liveId}/rtm/history?${params}`,
      { method: 'GET' },
      token,
    )
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const messages = (await res.json()) as ChatHistoryMessage[]
  return { ok: true, messages }
}

// ─── getLivesBySeller ─────────────────────────────────────────────────────────

export type GetLivesBySellerResult =
  | { ok: true;  lives: LiveResponse[] }
  | { ok: false; error: string }

/**
 * Lists the authenticated seller's lives, optionally filtered by status.
 * The sellerId required by the backend contract is derived from the JWT `sub`
 * claim (same technique as getChatToken's rtmUid) rather than taken as a
 * parameter — this keeps the call site simple and doesn't depend on the
 * seller having a store yet (lives can exist under SELLER_PROFILE context).
 */
export async function getLivesBySeller(status?: LiveResponse['status']): Promise<GetLivesBySellerResult> {
  const token    = await requireToken()
  const sellerId = extractSubFromJwt(token)
  if (!sellerId) return { ok: false, error: 'No se pudo obtener la identidad del vendedor' }

  const params = new URLSearchParams({ sellerId })
  if (status) params.set('status', status)

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives?${params}`, { method: 'GET' }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const lives = await res.json()
  return { ok: true, lives: lives as LiveResponse[] }
}


// ─── startLive ────────────────────────────────────────────────────────────────

export type StartLiveResult =
  | { ok: true;  live: LiveResponse }
  | { ok: false; error: string }

export async function startLive(liveId: string, rtcUid: string): Promise<StartLiveResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/lives/${liveId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rtcUid }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const live = await res.json()
  return { ok: true, live: live as LiveResponse }
}
