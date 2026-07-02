import { getMyStore } from '@/lib/storeActions'
import { ScheduleLiveForm } from './_components/ScheduleLiveForm'

export default async function ScheduleLivePage() {
  const store = await getMyStore()
  return <ScheduleLiveForm storeId={store?.id ?? null} />
}
