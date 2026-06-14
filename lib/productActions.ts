'use server'

import { cookies } from 'next/headers'
import { createProductSchema, updateProductSchema } from './schemas'
import type { ProductView, Category } from './types'

const API = process.env.API_URL ?? 'http://localhost:8080'

async function parseProblemDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? 'Ocurrió un error inesperado'
  } catch {
    return 'Ocurrió un error inesperado'
  }
}

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value ?? null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export type ProductQueryParams = {
  sort?: 'RECENTLY_ADDED' | 'PRICE_ASC' | 'PRICE_DESC'
  categoryId?: string | null
  stockLevel?: 'ALL' | 'CRITICAL' | 'NORMAL'
}

export async function getMyProducts(params?: ProductQueryParams): Promise<ProductView[]> {
  const token = await getToken()
  if (!token) return []
  try {
    const qs = new URLSearchParams()
    if (params?.sort) qs.set('sort', params.sort)
    if (params?.categoryId) qs.set('categoryId', params.categoryId)
    if (params?.stockLevel && params.stockLevel !== 'ALL') qs.set('stockLevel', params.stockLevel)

    const query = qs.toString()
    const res = await fetch(`${API}/api/products/me${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return res.json() as Promise<ProductView[]>
  } catch {
    return []
  }
}

export async function getMyCategories(): Promise<Category[]> {
  const token = await getToken()
  if (!token) return []
  try {
    const res = await fetch(`${API}/api/products/me/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[getMyCategories] ${res.status} ${res.statusText}:`, body)
      return []
    }
    const data: Category[] = await res.json()
    return data
  } catch (err) {
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

  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  const { name, categoryId, description, basePrice, currency, stock } = parsed.data

  try {
    const imageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)

    let imageUrls: string[] = []
    if (imageFiles.length > 0) {
      const mediaForm = new FormData()
      imageFiles.forEach((f) => mediaForm.append('files', f))
      mediaForm.append('context', 'products')

      const mediaRes = await fetch(`${API}/api/media/images/batch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: mediaForm,
      })

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      imageUrls = ((await mediaRes.json()) as { urls: string[] }).urls
    }

    const productRes = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        categoryId,
        ...(description ? { description } : {}),
        basePrice,
        currency,
        images: imageUrls.map((url, idx) => ({ url, position: idx, primary: idx === 0 })),
      }),
    })

    if (!productRes.ok) {
      const error = await parseProblemDetail(productRes)
      return { ok: false, error }
    }

    const product = (await productRes.json()) as ProductResponse

    if (stock > 0) {
      const defaultVariant = product.variants.find((v) => v.isDefault)
      if (defaultVariant) {
        try {
          await fetch(
            `${API}/api/products/${product.id}/variants/${defaultVariant.id}/stock`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ quantity: stock }),
            },
          )
        } catch {
          // non-blocking
        }
      }
    }

    return { ok: true, product }
  } catch {
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
    // active is handled separately via PATCH /deactivate — not part of PUT body
    wantsPause: formData.get('wantsPause'),
  })

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { ok: false, error: first ?? 'Datos inválidos' }
  }

  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  const {
    name,
    categoryId,
    description,
    basePrice,
    currency,
    additionalStock,
    wantsPause,
  } = parsed.data

  try {
    // 1. Upload new images batch
    const imageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
    const deletedImageIds = formData.getAll('deletedImageIds') as string[]

    let newImageUrls: string[] = []
    if (imageFiles.length > 0) {
      const mediaForm = new FormData()
      imageFiles.forEach((f) => mediaForm.append('files', f))
      mediaForm.append('context', 'products')

      const mediaRes = await fetch(`${API}/api/media/images/batch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: mediaForm,
      })

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      newImageUrls = ((await mediaRes.json()) as { urls: string[] }).urls
    }

    // 2. Update product fields (PUT /api/products/{id})
    // Note: UpdateProductRequest does NOT include `active` — handled via PATCH /deactivate
    const productRes = await fetch(`${API}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        ...(categoryId ? { categoryId } : {}),
        ...(description ? { description } : {}),
        basePrice,
        currency,
      }),
    })

    if (!productRes.ok) {
      const error = await parseProblemDetail(productRes)
      return { ok: false, error }
    }

    // 3. Pause or resume (PATCH /api/products/{id}/pause|resume) — reversible, product stays in list
    try {
      await fetch(`${API}/api/products/${productId}/${wantsPause ? 'pause' : 'resume'}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // non-blocking
    }

    // 4. Delete removed images — best-effort, parallel
    if (deletedImageIds.length > 0) {
      await Promise.allSettled(
        deletedImageIds.map((imageId) =>
          fetch(`${API}/api/products/${productId}/images/${imageId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )
    }

    // 5. Associate new images via batch — best-effort
    // primary: false because the backend automatically assigns primary to the next image
    // when the previous primary is deleted.
    if (newImageUrls.length > 0) {
      try {
        await fetch(`${API}/api/products/${productId}/images/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: newImageUrls.map((url, idx) => ({ url, position: idx, primary: false })),
          }),
        })
      } catch {
        // non-blocking
      }
    }

    // 6. Add stock if user entered a positive amount — best-effort
    // Backend AddStockRequest requires quantity >= 1 (additive, not absolute)
    if (additionalStock && additionalStock > 0) {
      try {
        await fetch(
          `${API}/api/products/${productId}/variants/${variantId}/stock`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: additionalStock }),
          },
        )
      } catch {
        // non-blocking
      }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type DeleteProductImageResult = { ok: true } | { ok: false; error: string }

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<DeleteProductImageResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type AddProductImagesBatchResult = { ok: true } | { ok: false; error: string }

export async function addProductImagesBatch(
  productId: string,
  images: Array<{ url: string; position: number; primary: boolean }>,
): Promise<AddProductImagesBatchResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/products/${productId}/images/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ images }),
    })

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type PauseProductResult = { ok: true } | { ok: false; error: string }

export async function pauseProduct(productId: string): Promise<PauseProductResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/products/${productId}/pause`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type ResumeProductResult = { ok: true } | { ok: false; error: string }

export async function resumeProduct(productId: string): Promise<ResumeProductResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/products/${productId}/resume`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}

export type DeactivateProductResult =
  | { ok: true }
  | { ok: false; error: string }

export async function deactivateProduct(productId: string): Promise<DeactivateProductResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'No autenticado' }

  try {
    const res = await fetch(`${API}/api/products/${productId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const error = await parseProblemDetail(res)
      return { ok: false, error }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' }
  }
}
