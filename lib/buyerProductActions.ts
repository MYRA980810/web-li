'use server'

import { API, parseProblemDetail, isNextInternalError } from './fetchWithAuth'
import type { PageResponse } from './buyerStoreActions'
import type { ProductView } from './types'

// ─── getProductsByStore ───────────────────────────────────────────────────────

/** Single-store catalog — unpaged (backend returns a plain List<ProductView>),
 * so the full catalog is fetched in one call and filtered/sorted client-side. */
export async function getProductsByStore(storeId: string, categoryId?: string): Promise<ProductView[]> {
  const params = new URLSearchParams({ storeId })
  if (categoryId) params.set('categoryId', categoryId)

  try {
    const res = await fetch(`${API}/api/products?${params}`)
    if (!res.ok) return []
    return res.json() as Promise<ProductView[]>
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return []
  }
}

// ─── getProductReviews ────────────────────────────────────────────────────────

export type ProductReviewResponse = {
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

export type GetProductReviewsResult =
  | { ok: true;  page: PageResponse<ProductReviewResponse> }
  | { ok: false; error: string }

export async function getProductReviews(productId: string, page = 0, size = 20): Promise<GetProductReviewsResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })

  let res: Response
  try {
    res = await fetch(`${API}/api/products/${productId}/reviews?${params}`)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await parseProblemDetail(res)
    return { ok: false, error }
  }

  const page_ = await res.json()
  return { ok: true, page: page_ as PageResponse<ProductReviewResponse> }
}
