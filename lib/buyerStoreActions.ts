'use server'

import { API, parseProblemDetail, isNextInternalError, getToken, fetchWithAuth } from './fetchWithAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export type StoreCardResponse = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  averageRating: number
  reviewCount: number
  rankingPosition: number | null
  followerCount: number
  liveNow: boolean
}

export type StoreReviewResponse = {
  storeId: string
  buyerDisplayName: string | null
  descriptionAccuracyRating: number
  packagingConditionRating: number
  deliveryTimelinessRating: number
  sellerAttentionRating: number
  rankingImpactScore: number
  comment: string | null
  anonymous: boolean
  photoUrls: string[]
  productRatings: { productId: string; rating: number }[]
  createdAt: string
}

// ─── getStores ────────────────────────────────────────────────────────────────

export type GetStoresResult =
  | { ok: true;  page: PageResponse<StoreCardResponse> }
  | { ok: false; error: string }

/** Public store explorer listing. No filter/sort params exist server-side —
 * only pagination. Callers filter/sort the accumulated list client-side. */
export async function getStores(page = 0, size = 20): Promise<GetStoresResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })

  let res: Response
  try {
    res = await fetch(`${API}/api/stores?${params}`)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const page_ = await res.json()
  return { ok: true, page: page_ as PageResponse<StoreCardResponse> }
}

// ─── getStoreBySlug ───────────────────────────────────────────────────────────

export async function getStoreBySlug(slug: string): Promise<StoreCardResponse | null> {
  try {
    const res = await fetch(`${API}/api/stores/${slug}`)
    if (!res.ok) return null
    return res.json() as Promise<StoreCardResponse>
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return null
  }
}

// ─── getStoreById ─────────────────────────────────────────────────────────────

/**
 * WORKAROUND: the backend has no by-id store lookup, only by-slug
 * (`GET /api/stores/{slug}`). Cart lines and the product-detail page only
 * carry a `storeId`, so this scans the store listing instead of a real
 * lookup. Backend debt — flag for a real `GET /api/stores/by-id/{id}` or a
 * batch `?ids=` endpoint if this ever needs to scale past a few hundred stores.
 */
export async function getStoreById(storeId: string): Promise<StoreCardResponse | null> {
  const result = await getStores(0, 200)
  if (!result.ok) return null
  return result.page.content.find((s) => s.id === storeId) ?? null
}

// ─── getStoreReviews ──────────────────────────────────────────────────────────

export type GetStoreReviewsResult =
  | { ok: true;  page: PageResponse<StoreReviewResponse> }
  | { ok: false; error: string }

export async function getStoreReviews(storeId: string, page = 0, size = 20): Promise<GetStoreReviewsResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })

  let res: Response
  try {
    res = await fetch(`${API}/api/stores/${storeId}/reviews?${params}`)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const page_ = await res.json()
  return { ok: true, page: page_ as PageResponse<StoreReviewResponse> }
}

// ─── Store follow (BUYER) ─────────────────────────────────────────────────────

export type FollowStoreResult = { ok: true } | { ok: false; error: string }

/** BUYER-only `POST|DELETE /api/stores/{storeId}/follow` (204 on success). */
async function sendFollowRequest(storeId: string, method: 'POST' | 'DELETE'): Promise<FollowStoreResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Inicia sesión para seguir tiendas' }

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/stores/${encodeURIComponent(storeId)}/follow`, { method }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (res.ok) return { ok: true }
  return { ok: false, error: await parseProblemDetail(res) }
}

export async function followStore(storeId: string): Promise<FollowStoreResult> {
  return sendFollowRequest(storeId, 'POST')
}

export async function unfollowStore(storeId: string): Promise<FollowStoreResult> {
  return sendFollowRequest(storeId, 'DELETE')
}

/** `GET /api/stores/{storeId}/following` is permitAll and degrades to false
 * for anonymous callers; any failure here also resolves to false. */
export async function getFollowingStatus(storeId: string): Promise<boolean> {
  const token = await getToken()
  if (!token) return false
  try {
    const res = await fetchWithAuth(`${API}/api/stores/${encodeURIComponent(storeId)}/following`, { method: 'GET' }, token)
    if (!res.ok) return false
    const data = (await res.json()) as { following?: unknown }
    return data.following === true
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return false
  }
}
