'use server'

import { API, parseProblemDetail, requireToken, isNextInternalError, fetchWithAuth } from './fetchWithAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartLineResponse = {
  productId: string
  variantId: string | null
  name: string
  imageUrl: string | null
  unitPrice: number
  currency: string
  quantity: number
  availableStock: number
  blockedReason: 'LIVE_EXCLUSIVE' | null
}

export type StoreCartResponse = {
  storeId: string
  lines: CartLineResponse[]
}

export type CombinedCartResponse = {
  stores: StoreCartResponse[]
}

export type SkippedLineResponse = {
  productId: string
  variantId: string | null
  reason: 'OUT_OF_STOCK' | 'LIVE_EXCLUSIVE' | 'UNAVAILABLE'
}

export type StoreCheckoutResultResponse = {
  storeId: string
  succeeded: boolean
  orderId: string | null
  total: number | null
  currency: string | null
  skippedLines: SkippedLineResponse[]
  failureReason: 'ALL_ITEMS_UNAVAILABLE' | 'RESERVATION_FAILED' | 'STORE_CHECKOUT_ERROR' | null
}

export type CheckoutCartResponse = {
  results: StoreCheckoutResultResponse[]
}

async function errorFor(res: Response): Promise<string> {
  if (res.status === 503) return 'Carrito temporalmente no disponible, reintentá'
  return parseProblemDetail(res)
}

// ─── getCart ──────────────────────────────────────────────────────────────────

export type GetCartResult =
  | { ok: true;  cart: CombinedCartResponse }
  | { ok: false; error: string }

export async function getCart(): Promise<GetCartResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/cart`, { method: 'GET' }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await errorFor(res)
    return { ok: false, error }
  }

  const cart = await res.json()
  return { ok: true, cart: cart as CombinedCartResponse }
}

// ─── addToCart ────────────────────────────────────────────────────────────────

export type AddToCartResponse = {
  success: boolean
  rejectionReason: 'UNAVAILABLE' | 'LIVE_EXCLUSIVE' | 'QUANTITY_LIMIT_EXCEEDED' | null
}

export type AddToCartActionResult =
  | { ok: true;  result: AddToCartResponse }
  | { ok: false; error: string }

export async function addToCart(
  storeId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
): Promise<AddToCartActionResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/cart/stores/${storeId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId, quantity }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  // 400/409 here are expected business-rejection responses with a body, not transport failures.
  if (!res.ok && res.status !== 400 && res.status !== 409) {
    const error = await errorFor(res)
    return { ok: false, error }
  }

  const result = await res.json()
  return { ok: true, result: result as AddToCartResponse }
}

// ─── incrementCartItem / decrementCartItem ────────────────────────────────────

export type ChangeQuantityResponse = {
  success: boolean
  failureReason: 'LINE_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'UNAVAILABLE' | 'QUANTITY_LIMIT_EXCEEDED' | null
  availableStock: number | null
  resultingQuantity: number
}

export type ChangeQuantityActionResult =
  | { ok: true;  result: ChangeQuantityResponse }
  | { ok: false; error: string }

async function changeQuantity(
  direction: 'increment' | 'decrement',
  storeId: string,
  productId: string,
  variantId: string | null,
  delta: number,
): Promise<ChangeQuantityActionResult> {
  const token = await requireToken()
  const params = new URLSearchParams({ delta: String(delta) })
  if (variantId) params.set('variantId', variantId)

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/cart/stores/${storeId}/items/${productId}/${direction}?${params}`,
      { method: 'POST' },
      token,
    )
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok && res.status !== 404 && res.status !== 400 && res.status !== 409) {
    const error = await errorFor(res)
    return { ok: false, error }
  }

  const result = await res.json()
  return { ok: true, result: result as ChangeQuantityResponse }
}

export async function incrementCartItem(
  storeId: string,
  productId: string,
  variantId: string | null,
  delta = 1,
): Promise<ChangeQuantityActionResult> {
  return changeQuantity('increment', storeId, productId, variantId, delta)
}

export async function decrementCartItem(
  storeId: string,
  productId: string,
  variantId: string | null,
  delta = 1,
): Promise<ChangeQuantityActionResult> {
  return changeQuantity('decrement', storeId, productId, variantId, delta)
}

// ─── removeCartItem ───────────────────────────────────────────────────────────

export type RemoveCartItemResult = { ok: true } | { ok: false; error: string }

export async function removeCartItem(
  storeId: string,
  productId: string,
  variantId: string | null,
): Promise<RemoveCartItemResult> {
  const token = await requireToken()
  const params = new URLSearchParams()
  if (variantId) params.set('variantId', variantId)
  const query = params.toString()

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/cart/stores/${storeId}/items/${productId}${query ? `?${query}` : ''}`,
      { method: 'DELETE' },
      token,
    )
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await errorFor(res)
    return { ok: false, error }
  }

  return { ok: true }
}

// ─── checkoutCart ─────────────────────────────────────────────────────────────

export type CheckoutSelection = { storeId: string; productId: string; variantId?: string | null }

export type CheckoutCartActionResult =
  | { ok: true;  response: CheckoutCartResponse }
  | { ok: false; error: string }

/** Initiates checkout — creates RESERVED orders per store, never touches
 * payment. Always returns 200 on the happy path; per-store outcomes live in
 * `response.results`, not in this action's ok/error split. */
export async function checkoutCart(selectedItems: CheckoutSelection[]): Promise<CheckoutCartActionResult> {
  const token = await requireToken()

  let res: Response
  try {
    res = await fetchWithAuth(`${API}/api/cart/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedItems }),
    }, token)
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }

  if (!res.ok) {
    const error = await errorFor(res)
    return { ok: false, error }
  }

  const response = await res.json()
  return { ok: true, response: response as CheckoutCartResponse }
}
