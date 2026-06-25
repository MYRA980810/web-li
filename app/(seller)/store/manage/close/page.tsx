import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ConfirmCloseScreen } from './_components/ConfirmCloseScreen'
import { getMyStore } from '@/lib/storeActions'

export default async function StoreManageClosePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''
  if (!token) redirect('/login')
  const store = await getMyStore()
  if (!store) redirect('/store')
  return <ConfirmCloseScreen isClosed={store.temporarilyClosed} />
}
