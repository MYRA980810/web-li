import { getSellerPayoutAccountDetails, listSellerPayouts } from '@/lib/profileActions'
import { CuentaPagosScreen } from './_components/CuentaPagosScreen'

export default async function CuentaPagosPage() {
  const [details, payouts] = await Promise.all([getSellerPayoutAccountDetails(), listSellerPayouts()])
  return <CuentaPagosScreen details={details} payouts={payouts} />
}
