import { getSellerPayoutAccountDetails } from '@/lib/profileActions'
import { MetodosPagoScreen } from './_components/MetodosPagoScreen'

export default async function MetodosPagoPage() {
  const details = await getSellerPayoutAccountDetails()
  return <MetodosPagoScreen details={details} />
}
