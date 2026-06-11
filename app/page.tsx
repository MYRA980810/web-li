import { redirect } from 'next/navigation'
import { getSessionPayload } from '@/lib/session'
import { HomeScreen } from './_components/HomeScreen'
import { SellerHomeScreen } from './(seller)/home/_components/SellerHomeScreen'

export default async function RootPage() {
  const session = await getSessionPayload()
  if (!session) redirect('/splash')

  if (session.role === 'SELLER') return <SellerHomeScreen />
  return <HomeScreen />
}
