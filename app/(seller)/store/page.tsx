import { cookies } from 'next/headers'
import { SellerStoreWelcome } from './_components/SellerStoreWelcome'
import { SellerStoreDashboard } from './_components/SellerStoreDashboard'
import type { StoreResponse } from '@/lib/storeActions'
import type { ProductItem } from './_components/SellerStoreDashboard'

const API = process.env.API_URL ?? 'http://localhost:8080'

async function getMyStore(token: string): Promise<StoreResponse | null> {
  try {
    const res = await fetch(`${API}/api/stores/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json() as Promise<StoreResponse>
  } catch {
    return null
  }
}

async function getMyProducts(token: string): Promise<ProductItem[]> {
  try {
    const res = await fetch(`${API}/api/products/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('[getMyProducts] status:', res.status)
    if (!res.ok) {
      const body = await res.text()
      console.error('[getMyProducts] error body:', body)
      return []
    }
    const data = await res.json()
    console.log('[getMyProducts] data:', JSON.stringify(data).slice(0, 300))
    return Array.isArray(data) ? data : (data.content ?? [])
  } catch (err) {
    console.error('[getMyProducts] fetch failed:', err)
    return []
  }
}

export default async function SellerStorePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''

  if (!token) return <SellerStoreWelcome />

  const [store, products] = await Promise.all([
    getMyStore(token),
    getMyProducts(token),
  ])

  return store
    ? <SellerStoreDashboard store={store} products={products} />
    : <SellerStoreWelcome />
}
