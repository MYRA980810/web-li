import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SellerStoreWelcome } from './_components/SellerStoreWelcome'
import { StoreInfoScreen } from './info/_components/StoreInfoScreen'
import type { StoreResponse } from '@/lib/storeActions'

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

export default async function SellerStorePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''

  if (!token) redirect('/login')

  const store = await getMyStore(token)

  return store ? <StoreInfoScreen store={store} /> : <SellerStoreWelcome />
}
