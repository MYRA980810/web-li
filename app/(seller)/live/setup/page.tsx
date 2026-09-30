import { getMyStore } from '@/lib/storeActions'
import { getMyProducts, getMyCategories } from '@/lib/productActions'
import { getCategories } from '@/lib/categoryActions'
import { LIVE_CATEGORIES_REVALIDATE_SECONDS, resolveLiveCategory, selectFeatured } from '@/lib/liveCategories'
import { GoLiveSetupScreen } from './_components/GoLiveSetupScreen'

export default async function GoLiveSetupPage() {
  const [store, products, categories, rawLiveCategories] = await Promise.all([
    getMyStore(),
    getMyProducts(),
    getMyCategories(),
    getCategories({ revalidate: LIVE_CATEGORIES_REVALIDATE_SECONDS }),
  ])

  const liveCategories = selectFeatured(rawLiveCategories).map(resolveLiveCategory)

  return (
    <GoLiveSetupScreen
      storeId={store?.id ?? null}
      products={products}
      categories={categories}
      liveCategories={liveCategories}
    />
  )
}
