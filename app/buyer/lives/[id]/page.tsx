import { LiveFeedScreen, type LiveStoreInfo } from './_components/LiveFeedScreen'
import { getActiveLiveOrder, getLiveById, getLiveProducts } from '@/lib/liveActions'
import { getFollowingStatus, getStoreById } from '@/lib/buyerStoreActions'

export default async function BuyerLiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [live, productsResult, initialOrder] = await Promise.all([
    getLiveById(id),
    getLiveProducts(id),
    getActiveLiveOrder(id),
  ])

  // getLiveById collapses "not found" and transient backend/auth failures into
  // the same null — logged here so an outage is at least visible server-side.
  // The screen itself shows a graceful fallback instead of silently redirecting
  // the buyer away, since we can't tell "gone" from "temporarily unreachable".
  if (!live) console.error('BuyerLiveDetailPage: getLiveById returned null for live', id)

  const products = productsResult.ok ? productsResult.products : []

  // Store header data. getStoreById is a listing scan (no by-id endpoint);
  // lives in SELLER_PROFILE context have no store at all.
  let store: LiveStoreInfo | null = null
  let initialFollowing = false
  if (live?.storeId) {
    const [storeCard, following] = await Promise.all([
      getStoreById(live.storeId),
      getFollowingStatus(live.storeId),
    ])
    if (storeCard) {
      store = {
        id: storeCard.id,
        name: storeCard.name,
        logoUrl: storeCard.logoUrl,
        followerCount: storeCard.followerCount,
      }
    }
    initialFollowing = following
  }

  return (
    <LiveFeedScreen
      live={live}
      products={products}
      store={store}
      initialFollowing={initialFollowing}
      initialOrder={initialOrder}
    />
  )
}
