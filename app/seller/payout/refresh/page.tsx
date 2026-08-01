import { redirect } from 'next/navigation'
import { createPayoutOnboardingLink } from '@/lib/profileActions'

export default async function PayoutRefreshPage() {
  const result = await createPayoutOnboardingLink()

  if (result.ok) {
    redirect(result.url)
  }

  redirect('/perfil/completar?step=pago&retry=1')
}
