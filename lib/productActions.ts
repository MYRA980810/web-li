'use server'

import { cookies } from 'next/headers'
import { createProductSchema, updateProductSchema } from './schemas'
import type { ProductView } from './types'

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

export async function getMyProducts(): Promise<ProductView[]> {
  const token = await getToken()
  if (!token) return []
  try {
    const res = await fetch(`${API}/api/products/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return res.json() as Promise<ProductView[]>
  } catch {
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
    let imageUrl: string | null = null
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const mediaForm = new FormData()
      mediaForm.append('file', imageFile)
      mediaForm.append('context', 'products')

      const mediaRes = await fetch(`${API}/api/media/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: mediaForm,
      })

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      const mediaData = await mediaRes.json()
      imageUrl = mediaData.url as string
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
      }),
    })

    if (!productRes.ok) {
      const error = await parseProblemDetail(productRes)
      return { ok: false, error }
    }

    const product = (await productRes.json()) as ProductResponse

    if (imageUrl) {
      try {
        await fetch(`${API}/api/products/${product.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: imageUrl, position: 0, primary: true }),
        })
      } catch {
        // non-blocking
      }
    }

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
    wantsDeactivate: formData.get('wantsDeactivate'),
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
    wantsDeactivate,
  } = parsed.data

  try {
    // 1. Upload image if changed
    let imageUrl: string | null = null
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const mediaForm = new FormData()
      mediaForm.append('file', imageFile)
      mediaForm.append('context', 'products')

      const mediaRes = await fetch(`${API}/api/media/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: mediaForm,
      })

      if (!mediaRes.ok) {
        const error = await parseProblemDetail(mediaRes)
        return { ok: false, error }
      }

      const mediaData = await mediaRes.json()
      imageUrl = mediaData.url as string
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

    // 3. Deactivate if requested (PATCH /api/products/{id}/deactivate)
    if (wantsDeactivate) {
      try {
        await fetch(`${API}/api/products/${productId}/deactivate`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // non-blocking
      }
    }

    // 4. Update product image — best-effort
    if (imageUrl) {
      try {
        await fetch(`${API}/api/products/${productId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: imageUrl, position: 0, primary: true }),
        })
      } catch {
        // non-blocking
      }
    }

    // 5. Add stock if user entered a positive amount — best-effort
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
