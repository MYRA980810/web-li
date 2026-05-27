import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { HomeScreen } from './_components/HomeScreen'

export default async function RootPage() {
  const cookieStore = await cookies()
  if (!cookieStore.has('session')) {
    redirect('/splash')
  }
  return <HomeScreen />
}
