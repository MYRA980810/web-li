import { notFound } from 'next/navigation'
import { LIVES } from '../_components/mockLives'
import { ReporteLiveScreen } from './_components/ReporteLiveScreen'

export default async function ReporteLivePage({ params }: { params: Promise<{ liveId: string }> }) {
  const { liveId } = await params
  const live = LIVES.find((l) => l.id === liveId)

  if (!live) notFound()

  return <ReporteLiveScreen live={live} />
}
