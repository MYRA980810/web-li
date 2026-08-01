import { redirect } from 'next/navigation'
import { getPayoutStatus } from '@/lib/profileActions'

const RETRY_DELAYS_MS = [500, 1000, 2000]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function PayoutReturnPage() {
  for (const delay of RETRY_DELAYS_MS) {
    const status = await getPayoutStatus()
    if (status?.payoutsEnabled && status?.detailsSubmitted) {
      redirect('/perfil/completar?step=direccion')
    }
    await sleep(delay)
  }

  const status = await getPayoutStatus()
  if (status?.payoutsEnabled && status?.detailsSubmitted) {
    redirect('/perfil/completar?step=direccion')
  }

  redirect('/perfil/completar?step=pago&retry=1')
}
