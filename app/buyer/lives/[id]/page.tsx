import { LiveFeedScreen } from './_components/LiveFeedScreen'

export default async function BuyerLiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LiveFeedScreen liveId={id} />
}
