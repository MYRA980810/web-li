import { LiveExplorerScreen } from './_components/LiveExplorerScreen'
import { getActiveLives, getUpcomingLives, type LiveFeedCardResponse, type LiveUpcomingCardResponse, type PageResponse } from '@/lib/liveActions'

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

export default async function BuyerLivesPage() {
  const [activeResult, upcomingResult] = await Promise.all([getActiveLives(0), getUpcomingLives(0)])

  if (!activeResult.ok) console.error('BuyerLivesPage: getActiveLives failed —', activeResult.error)
  if (!upcomingResult.ok) console.error('BuyerLivesPage: getUpcomingLives failed —', upcomingResult.error)

  const initialActive: PageResponse<LiveFeedCardResponse> = activeResult.ok ? activeResult.page : EMPTY_PAGE
  const initialUpcoming: PageResponse<LiveUpcomingCardResponse> = upcomingResult.ok ? upcomingResult.page : EMPTY_PAGE

  return (
    <LiveExplorerScreen
      initialActive={initialActive}
      initialUpcoming={initialUpcoming}
      activeError={!activeResult.ok}
      upcomingError={!upcomingResult.ok}
    />
  )
}
