import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EditStoreForm } from './_components/EditStoreForm'
import { getMyStore } from '@/lib/storeActions'

export default async function EditStorePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? ''
  if (!token) redirect('/login')

  const store = await getMyStore()
  if (!store) redirect('/store')

  return <EditStoreForm store={store} />
}
