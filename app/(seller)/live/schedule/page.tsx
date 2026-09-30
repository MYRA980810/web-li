import { getMyStore } from '@/lib/storeActions'
import { getCategories } from '@/lib/categoryActions'
import { LIVE_CATEGORIES_REVALIDATE_SECONDS, resolveLiveCategory, selectFeatured } from '@/lib/liveCategories'
import { ScheduleLiveForm } from './_components/ScheduleLiveForm'

export default async function ScheduleLivePage() {
  const [store, rawLiveCategories] = await Promise.all([
    getMyStore(),
    getCategories({ revalidate: LIVE_CATEGORIES_REVALIDATE_SECONDS }),
  ])

  const liveCategories = selectFeatured(rawLiveCategories).map(resolveLiveCategory)

  return <ScheduleLiveForm storeId={store?.id ?? null} liveCategories={liveCategories} />
}
