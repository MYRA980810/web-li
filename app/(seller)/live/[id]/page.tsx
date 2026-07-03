import { getLiveById } from '@/lib/liveActions'
import { LiveDetailScreen } from './_components/LiveDetailScreen'

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const live = await getLiveById(id)
  return <LiveDetailScreen live={live} />
}
