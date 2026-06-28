import { getMyStore } from '@/lib/storeActions'
import { GoLiveSetupScreen } from './_components/GoLiveSetupScreen'

export default async function GoLiveSetupPage() {
  const store = await getMyStore()
  return <GoLiveSetupScreen storeId={store?.id ?? null} />
}
