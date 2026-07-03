import { getMyStore } from '@/lib/storeActions'
import { getMyProducts, getMyCategories } from '@/lib/productActions'
import { GoLiveSetupScreen } from './_components/GoLiveSetupScreen'

export default async function GoLiveSetupPage() {
  const [store, products, categories] = await Promise.all([
    getMyStore(),
    getMyProducts(),
    getMyCategories(),
  ])

  return <GoLiveSetupScreen storeId={store?.id ?? null} products={products} categories={categories} />
}
