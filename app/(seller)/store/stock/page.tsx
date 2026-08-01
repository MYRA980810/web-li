import { StockScreen } from './_components/StockScreen'
import { getMyProducts, getMyCategories } from '@/lib/productActions'

export default async function StockPage() {
  const [products, categories] = await Promise.all([
    getMyProducts(),
    getMyCategories(),
  ])

  return <StockScreen products={products} categories={categories} />
}
