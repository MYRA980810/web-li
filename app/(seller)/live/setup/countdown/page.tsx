import { redirect } from 'next/navigation'
import { GoLiveCountdownScreen } from './_components/GoLiveCountdownScreen'

export default async function GoLiveCountdownPage({
  searchParams,
}: {
  searchParams: Promise<{ liveId?: string }>
}) {
  const { liveId } = await searchParams
  if (!liveId) redirect('/live/setup')
  return <GoLiveCountdownScreen liveId={liveId} />
}
