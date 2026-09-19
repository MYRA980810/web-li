'use server'

import { API, parseProblemDetail, isNextInternalError } from './fetchWithAuth'

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
