import { CatalogoCompletoScreen } from './_components/CatalogoCompletoScreen'
import { getStoreById } from '@/lib/buyerStoreActions'
import { getProductsByStore } from '@/lib/buyerProductActions'
import { toBuyerStoreView, toBuyerProductCardView } from '@/lib/buyerViewMappers'

export default async function BuyerStoreCatalogPage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params
  const [storeResponse, products] = await Promise.all([getStoreById(storeId), getProductsByStore(storeId)])

  const store = storeResponse ? toBuyerStoreView(storeResponse) : null
  const productCards = products.map((p) => toBuyerProductCardView(p, store?.name ?? ''))

  return <CatalogoCompletoScreen store={store} products={productCards} />
}
