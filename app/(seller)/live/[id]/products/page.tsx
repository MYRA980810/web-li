import { getMyProducts, getMyCategories } from '@/lib/productActions'
import { SelectLiveStockScreen } from './_components/SelectLiveStockScreen'

export default async function SelectLiveStockPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [products, categories] = await Promise.all([
    getMyProducts(),
    getMyCategories(),
  ])

  return <SelectLiveStockScreen liveId={id} products={products} categories={categories} />
}
