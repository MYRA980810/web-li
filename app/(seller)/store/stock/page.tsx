import { StockScreen } from './_components/StockScreen'
import { getMyProducts, getMyCategories } from '@/lib/productActions'
import type { StockFilters } from './_components/StockFilterDrawer'

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; categoryId?: string; stockLevel?: string }>
}) {
  const params = await searchParams

  const sort = params.sort === 'PRICE_ASC' || params.sort === 'PRICE_DESC' || params.sort === 'RECENTLY_ADDED'
    ? (params.sort as 'PRICE_ASC' | 'PRICE_DESC' | 'RECENTLY_ADDED')
    : undefined

  const stockLevel = params.stockLevel === 'CRITICAL' || params.stockLevel === 'NORMAL'
    ? (params.stockLevel as 'CRITICAL' | 'NORMAL')
    : undefined

  const [products, categories] = await Promise.all([
    getMyProducts({ sort, categoryId: params.categoryId, stockLevel }),
    getMyCategories(),
  ])

  const initialFilters: StockFilters = {
    sortBy: params.sort === 'PRICE_ASC' ? 'price_asc' : params.sort === 'PRICE_DESC' ? 'price_desc' : 'newest',
    categoryId: params.categoryId ?? null,
    inventoryStatus: params.stockLevel === 'CRITICAL' ? 'critical' : params.stockLevel === 'NORMAL' ? 'normal' : 'all',
  }

  return <StockScreen products={products} categories={categories} initialFilters={initialFilters} />
}
