import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { StoreManageScreen } from './_components/StoreManageScreen'
import { getMyStore } from '@/lib/storeActions'

export default async function StoreManagePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''
  if (!token) redirect('/login')
  const store = await getMyStore()
  if (!store) redirect('/store')
  return <StoreManageScreen store={store} />
}
