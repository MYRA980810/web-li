import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SellerStoreWelcome } from './_components/SellerStoreWelcome'
import { StoreInfoScreen } from './info/_components/StoreInfoScreen'
import { getMyStore } from '@/lib/storeActions'

export default async function SellerStorePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''
  if (!token) redirect('/login')

  const store = await getMyStore()
  return store ? <StoreInfoScreen store={store} /> : <SellerStoreWelcome />
}
