import { LiveFeedScreen } from './_components/LiveFeedScreen'
import { getLiveById, getLiveProducts } from '@/lib/liveActions'

export default async function BuyerLiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [live, productsResult] = await Promise.all([getLiveById(id), getLiveProducts(id)])

  // getLiveById collapses "not found" and transient backend/auth failures into
  // the same null — logged here so an outage is at least visible server-side.
  // The screen itself shows a graceful fallback instead of silently redirecting
  // the buyer away, since we can't tell "gone" from "temporarily unreachable".
  if (!live) console.error('BuyerLiveDetailPage: getLiveById returned null for live', id)

  const products = productsResult.ok ? productsResult.products : []

  return <LiveFeedScreen live={live} products={products} />
}
