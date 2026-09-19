import { StoresExplorerScreen } from './_components/StoresExplorerScreen'
import { getStores } from '@/lib/buyerStoreActions'
import { toBuyerStoreView } from '@/lib/buyerViewMappers'

export default async function BuyerStoresPage() {
  const result = await getStores(0, 60)

  if (!result.ok) console.error('BuyerStoresPage: getStores failed —', result.error)

  const initialStores = result.ok ? result.page.content.map(toBuyerStoreView) : []
  const initialHasMore = result.ok ? !result.page.last : false

  return (
    <StoresExplorerScreen
      initialStores={initialStores}
      initialPage={0}
      initialHasMore={initialHasMore}
      loadError={!result.ok}
    />
  )
}
