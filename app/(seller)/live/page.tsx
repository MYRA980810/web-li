import { getMyStore, getFollowerCount } from '@/lib/storeActions'
import { getLivesBySeller } from '@/lib/liveActions'
import { LiveHubScreen } from './_components/LiveHubScreen'

export default async function LiveHubPage() {
  const store = await getMyStore()

  const [scheduledResult, endedResult, followerResult] = await Promise.all([
    getLivesBySeller('SCHEDULED'),
    getLivesBySeller('ENDED'),
    store ? getFollowerCount(store.id) : Promise.resolve<{ ok: false; error: string }>({ ok: false, error: 'no-store' }),
  ])

  const scheduledLives = scheduledResult.ok ? scheduledResult.lives : []
  const endedLives     = endedResult.ok ? endedResult.lives : []
  const followerCount   = followerResult.ok ? followerResult.count : 0

  return (
    <LiveHubScreen
      store={store}
      scheduledLives={scheduledLives}
      endedLives={endedLives}
      followerCount={followerCount}
    />
  )
}
