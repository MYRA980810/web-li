import { StockScreen } from './_components/StockScreen'
import { getMyProducts } from '@/lib/productActions'

export default async function StockPage() {
  const products = await getMyProducts()
  return <StockScreen products={products} />
}
