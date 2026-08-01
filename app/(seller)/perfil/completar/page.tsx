import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSessionPayload } from '@/lib/session'
import { getCurrentUserProfile } from '@/lib/profileActions'
import { CompleteProfileWizard } from './_components/CompleteProfileWizard'

export default async function CompleteProfilePage() {
  const session = await getSessionPayload()
  if (!session || session.role !== 'SELLER') redirect('/perfil')

  const profile = await getCurrentUserProfile()
  if (!profile) redirect('/perfil')
  if (profile.profileComplete) redirect('/perfil')

  return (
    <Suspense>
      <CompleteProfileWizard profile={profile} />
    </Suspense>
  )
}
