'use server'

import { createProductSchema, updateProductSchema } from './schemas'
import { API, parseProblemDetail, requireToken, isNextInternalError, fetchWithAuth } from './fetchWithAuth'
import type { ProductView, Category } from './types'

// ─── Queries ──────────────────────────────────────────────────────────────────

export type ProductQueryParams = {
  sort?: 'RECENTLY_ADDED' | 'PRICE_ASC' | 'PRICE_DESC'
  categoryId?: string | null
  stockLevel?: 'ALL' | 'CRITICAL' | 'NORMAL'
}

export async function getMyProducts(params?: ProductQueryParams): Promise<ProductView[]> {
  const token = await requireToken()
  try {
    const qs = new URLSearchParams()
    if (params?.sort) qs.set('sort', params.sort)
    if (params?.categoryId) qs.set('categoryId', params.categoryId)
    if (params?.stockLevel && params.stockLevel !== 'ALL') qs.set('stockLevel', params.stockLevel)

    const query = qs.toString()
    const res = await fetchWithAuth(`${API}/api/products/me${query ? `?${query}` : ''}`, {
      headers: {},
    }, token)
    if (!res.ok) return []
    return res.json() as Promise<ProductView[]>
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return []
  }
}

export async function getMyCategories(): Promise<Category[]> {
  const token = await requireToken()
  try {
    const res = await fetchWithAuth(`${API}/api/products/me/categories`, {
      headers: {},
    }, token)
    if (!res.ok) {
      const body = await res.text()
      console.error(`[getMyCategories] ${res.status} ${res.statusText}:`, body)
      return []
    }
    const data: Category[] = await res.json()
    return data
  } catch (err) {
    if (isNextInternalError(err)) throw err
    console.error('[getMyCategories] fetch error:', err)
    return []
  }
}

export async function getProductById(id: string): Promise<ProductView | null> {
  try {
    const res = await fetch(`${API}/api/products/${id}`)
    if (!res.ok) return null
    return res.json() as Promise<ProductView>
  } catch {
    return null
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

type VariantResponse = {
  id: string
  isDefault: boolean
}

type ProductResponse = {
  id: string
  name: string
  variants: VariantResponse[]
}

export type CreateProductResult =
  | { ok: true;  product: ProductResponse }
  | { ok: false; error: string }

export async function createProduct(formData: FormData): Promise<CreateProductResult> {
  const parsed = createProductSchema.safeParse({
    name:        formData.get('name'),
    categoryId:  formData.get('categoryId'),
    description: formData.get('description') || undefined,
    basePrice:   formData.get('basePrice'),
    currency:    formData.get('currency') || undefined,
    stock:       formData.get('stock'),
  })

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const token = await requireToken()

  const { name, categoryId, description, basePrice, currency, stock } = parsed.data

  try {
    const imageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)

    let imageUrls: string[] = []
    if (imageFiles.length > 0) {
      const mediaForm = new FormData()
      imageFiles.forEach((f) => mediaForm.append('files', f))
      mediaForm.append('context', 'products')

      const mediaRes = await fetchWithAuth(`${API}/api/media/images/batch`, {
        method: 'POST',
        body: mediaForm,
      }, token)

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      imageUrls = ((await mediaRes.json()) as { urls: string[] }).urls
    }

    const productRes = await fetchWithAuth(`${API}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        categoryId,
        ...(description ? { description } : {}),
        basePrice,
        currency,
        images: imageUrls.map((url, idx) => ({ url, position: idx, primary: idx === 0 })),
      }),
    }, token)

    if (!productRes.ok) {
      const error = await parseProblemDetail(productRes)
      return { ok: false, error }
    }

    const product = (await productRes.json()) as ProductResponse

    if (stock > 0) {
      const defaultVariant = product.variants.find((v) => v.isDefault)
      if (defaultVariant) {
        try {
          await fetchWithAuth(
            `${API}/api/products/${product.id}/variants/${defaultVariant.id}/stock`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: stock }),
            },
            token,
          )
        } catch (err) {
          if (isNextInternalError(err)) throw err
        }
      }
    }

    return { ok: true, product }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type UpdateProductResult =
  | { ok: true }
  | { ok: false; error: string }

export async function updateProduct(
  productId: string,
  variantId: string,
  formData: FormData,
): Promise<UpdateProductResult> {
  const parsed = updateProductSchema.safeParse({
    name:            formData.get('name'),
    categoryId:      formData.get('categoryId') || undefined,
    description:     formData.get('description') || undefined,
    basePrice:       formData.get('basePrice'),
    currency:        formData.get('currency') || undefined,
    additionalStock: formData.get('additionalStock'),
    correctStock:    formData.get('correctStock') || undefined,
    // active is handled separately via PATCH /deactivate — not part of PUT body
    wantsPause: formData.get('wantsPause'),
  })

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const token = await requireToken()

  const {
    name,
    categoryId,
    description,
    basePrice,
    currency,
    additionalStock,
    correctStock,
    wantsPause,
  } = parsed.data

  try {
    const imageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
    const deletedImageIds = formData.getAll('deletedImageIds') as string[]

    let newImageUrls: string[] = []
    if (imageFiles.length > 0) {
      const mediaForm = new FormData()
      imageFiles.forEach((f) => mediaForm.append('files', f))
      mediaForm.append('context', 'products')

      const mediaRes = await fetchWithAuth(`${API}/api/media/images/batch`, {
        method: 'POST',
        body: mediaForm,
      }, token)

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      newImageUrls = ((await mediaRes.json()) as { urls: string[] }).urls
    }

    const productRes = await fetchWithAuth(`${API}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        ...(categoryId ? { categoryId } : {}),
        ...(description ? { description } : {}),
        basePrice,
        currency,
      }),
    }, token)

    if (!productRes.ok) {
      const error = await parseProblemDetail(productRes)
      return { ok: false, error }
    }

    try {
      await fetchWithAuth(`${API}/api/products/${productId}/${wantsPause ? 'pause' : 'resume'}`, {
        method: 'PATCH',
        headers: {},
      }, token)
    } catch (err) {
      if (isNextInternalError(err)) throw err
    }

    if (deletedImageIds.length > 0) {
      await Promise.allSettled(
        deletedImageIds.map((imageId) =>
          fetchWithAuth(`${API}/api/products/${productId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {},
          }, token)
        )
      )
    }

    if (newImageUrls.length > 0) {
      try {
        await fetchWithAuth(`${API}/api/products/${productId}/images/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: newImageUrls.map((url, idx) => ({ url, position: idx, primary: false })),
          }),
        }, token)
      } catch (err) {
        if (isNextInternalError(err)) throw err
      }
    }

    const stockUrl = `${API}/api/products/${productId}/variants/${variantId}/stock`
    if (correctStock !== undefined) {
      const stockRes = await fetchWithAuth(stockUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableQuantity: correctStock }),
      }, token)
      if (!stockRes.ok) {
        const error = await parseProblemDetail(stockRes)
        return { ok: false, error }
      }
    } else if (additionalStock > 0) {
      try {
        await fetchWithAuth(stockUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: additionalStock }),
        }, token)
      } catch (err) {
        if (isNextInternalError(err)) throw err
      }
    }

    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type DeleteProductImageResult = { ok: true } | { ok: false; error: string }

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<DeleteProductImageResult> {
  const token = await requireToken()

  try {
    const res = await fetchWithAuth(`${API}/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {},
    }, token)

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type AddProductImagesBatchResult = { ok: true } | { ok: false; error: string }

export async function addProductImagesBatch(
  productId: string,
  images: Array<{ url: string; position: number; primary: boolean }>,
): Promise<AddProductImagesBatchResult> {
  const token = await requireToken()

  try {
    const res = await fetchWithAuth(`${API}/api/products/${productId}/images/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    }, token)

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type PauseProductResult = { ok: true } | { ok: false; error: string }

export async function pauseProduct(productId: string): Promise<PauseProductResult> {
  const token = await requireToken()

  try {
    const res = await fetchWithAuth(`${API}/api/products/${productId}/pause`, {
      method: 'PATCH',
      headers: {},
    }, token)
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type ResumeProductResult = { ok: true } | { ok: false; error: string }

export async function resumeProduct(productId: string): Promise<ResumeProductResult> {
  const token = await requireToken()

  try {
    const res = await fetchWithAuth(`${API}/api/products/${productId}/resume`, {
      method: 'PATCH',
      headers: {},
    }, token)
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type DeactivateProductResult =
  | { ok: true }
  | { ok: false; error: string }

export async function deactivateProduct(productId: string): Promise<DeactivateProductResult> {
  const token = await requireToken()

  try {
    const res = await fetchWithAuth(`${API}/api/products/${productId}/deactivate`, {
      method: 'PATCH',
      headers: {},
    }, token)

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch (err) {
    if (isNextInternalError(err)) throw err
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}
