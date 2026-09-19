import { TiendaBuyerScreen } from './_components/TiendaBuyerScreen'
import { getStoreById } from '@/lib/buyerStoreActions'
import { getProductsByStore } from '@/lib/buyerProductActions'
import { toBuyerStoreView, toBuyerProductCardView } from '@/lib/buyerViewMappers'

export default async function BuyerStoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params
  const [storeResponse, products] = await Promise.all([getStoreById(storeId), getProductsByStore(storeId)])

  const store = storeResponse ? toBuyerStoreView(storeResponse) : null
  const productCards = products.map((p) => toBuyerProductCardView(p, store?.name ?? ''))

  return <TiendaBuyerScreen store={store} products={productCards} />
}
