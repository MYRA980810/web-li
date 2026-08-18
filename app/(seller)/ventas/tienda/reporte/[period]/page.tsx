import { notFound } from 'next/navigation'
import { PERIOD_LABELS, type StoreReportPeriod } from '../../_components/mockTienda'
import { ReporteTiendaScreen } from './_components/ReporteTiendaScreen'

const VALID_PERIODS = Object.keys(PERIOD_LABELS) as StoreReportPeriod[]

export default async function ReporteTiendaPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params

  if (!VALID_PERIODS.includes(period as StoreReportPeriod)) notFound()

  return <ReporteTiendaScreen period={period as StoreReportPeriod} />
}
