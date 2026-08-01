import { CategoryProductsScreen } from './_components/CategoryProductsScreen'
import { getMyProducts, getMyCategories } from '@/lib/productActions'

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>
  searchParams: Promise<{ sort?: string; stockLevel?: string }>
}) {
  const { categoryId } = await params
  const query = await searchParams
  const isUncategorized = categoryId === 'uncategorized'

  const sort = query.sort === 'PRICE_ASC' || query.sort === 'PRICE_DESC'
    ? (query.sort as 'PRICE_ASC' | 'PRICE_DESC')
    : undefined

  const stockLevel = query.stockLevel === 'CRITICAL' || query.stockLevel === 'NORMAL'
    ? (query.stockLevel as 'CRITICAL' | 'NORMAL')
    : undefined

  const [products, categories] = await Promise.all([
    getMyProducts({ sort, categoryId: isUncategorized ? undefined : categoryId, stockLevel }),
    getMyCategories(),
  ])

  const items = isUncategorized ? products.filter((p) => !p.categoryId) : products
  const categoryName = isUncategorized
    ? 'Sin categoría'
    : categories.find((c) => c.id === categoryId)?.name ?? 'Categoría'

  return (
    <CategoryProductsScreen
      categoryName={categoryName}
      products={items}
      initialSort={query.sort === 'PRICE_ASC' ? 'price_asc' : query.sort === 'PRICE_DESC' ? 'price_desc' : 'none'}
      initialStockLevel={query.stockLevel === 'CRITICAL' ? 'critical' : query.stockLevel === 'NORMAL' ? 'normal' : 'all'}
    />
  )
}
