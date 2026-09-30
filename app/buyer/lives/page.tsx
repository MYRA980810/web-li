import { LiveExplorerScreen } from './_components/LiveExplorerScreen'
import { getCategories } from '@/lib/categoryActions'
import { resolveLiveCategory, selectFeatured } from '@/lib/liveCategories'
import {
  getActiveLiveCounts,
  getActiveLives,
  getUpcomingLives,
  type LiveFeedCardResponse,
  type LiveUpcomingCardResponse,
  type PageResponse,
} from '@/lib/liveActions'

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true }

// Featured categories rarely change — cache the catalog for 5 minutes.
const CATEGORIES_REVALIDATE_SECONDS = 300

export default async function BuyerLivesPage() {
  const [activeResult, upcomingResult, rawCategories, countsResult] = await Promise.all([
    getActiveLives(0),
    getUpcomingLives(0),
    getCategories({ revalidate: CATEGORIES_REVALIDATE_SECONDS }),
    getActiveLiveCounts(),
  ])

  if (!activeResult.ok) console.error('BuyerLivesPage: getActiveLives failed —', activeResult.error)
  if (!upcomingResult.ok) console.error('BuyerLivesPage: getUpcomingLives failed —', upcomingResult.error)
  if (!countsResult.ok) console.error('BuyerLivesPage: getActiveLiveCounts failed —', countsResult.error)

  const initialActive: PageResponse<LiveFeedCardResponse> = activeResult.ok ? activeResult.page : EMPTY_PAGE
  const initialUpcoming: PageResponse<LiveUpcomingCardResponse> = upcomingResult.ok ? upcomingResult.page : EMPTY_PAGE

  const categories = rawCategories.map(resolveLiveCategory)
  const featuredCategories = selectFeatured(rawCategories).map(resolveLiveCategory)

  return (
    <LiveExplorerScreen
      initialActive={initialActive}
      initialUpcoming={initialUpcoming}
      activeError={!activeResult.ok}
      upcomingError={!upcomingResult.ok}
      categories={categories}
      featuredCategories={featuredCategories}
      initialCounts={countsResult.ok ? countsResult.counts : null}
    />
  )
}
