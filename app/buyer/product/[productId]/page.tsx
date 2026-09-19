import { ProductDetailBuyerScreen } from './_components/ProductDetailBuyerScreen'
import { getProductById } from '@/lib/productActions'
import { getStoreById } from '@/lib/buyerStoreActions'
import { toBuyerStoreView, toBuyerProductDetailView } from '@/lib/buyerViewMappers'

export default async function BuyerProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ storeId?: string }>
}) {
  const { productId } = await params
  const { storeId } = await searchParams

  const productResponse = await getProductById(productId)
  const storeResponse = await getStoreById(storeId ?? productResponse?.storeId ?? '')

  const store = storeResponse ? toBuyerStoreView(storeResponse) : null
  const product = productResponse ? toBuyerProductDetailView(productResponse, store?.name ?? '') : null

  return <ProductDetailBuyerScreen product={product} store={store} />
}
