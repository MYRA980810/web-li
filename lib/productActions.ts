'use server'

import { cookies } from 'next/headers'
import { createProductSchema } from './schemas'

const API = process.env.API_URL ?? 'http://localhost:8080'

async function parseProblemDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? 'Ocurrió un error inesperado'
  } catch {
    return 'Ocurrió un error inesperado'
  }
}

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
  // 1. Validate
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

  // 2. Token guard
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return { ok: false, error: 'No autenticado' }

  const { name, categoryId, description, basePrice, currency, stock } = parsed.data

  try {
    // 3. Upload image if provided
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

    // 4. Create product
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

    // 5. Attach image — best-effort, product already exists
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

    // 6. Add stock to default variant — best-effort
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
