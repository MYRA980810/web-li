'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { useLivesFeedChannel } from '@/hooks/useLivesFeedChannel'
import { useLiveReminders } from '@/hooks/useLiveReminders'
import { ALL_LIVE_CATEGORY, type LiveCategory } from '@/lib/liveCategories'
import {
  getActiveLiveCounts,
  getActiveLives,
  getUpcomingLives,
  type ActiveLiveCounts,
  type LiveFeedCardResponse,
  type LiveUpcomingCardResponse,
  type PageResponse,
} from '@/lib/liveActions'
import { LiveCategoryProvider } from '../_lib/LiveCategoryContext'
import { searchLives } from '../_lib/livesView'
import { LiveCategoriesSheet } from './LiveCategoriesSheet'
import { LiveCategoryBar } from './LiveCategoryBar'
import { LiveModeToggle, type LiveViewMode } from './LiveModeToggle'
import { LiveNowGrid } from './LiveNowGrid'
import { LivesHeader } from './LivesHeader'
import { UpcomingTimeline } from './UpcomingTimeline'

export type LiveExplorerScreenProps = {
  initialActive: PageResponse<LiveFeedCardResponse>
  initialUpcoming: PageResponse<LiveUpcomingCardResponse>
  activeError?: boolean
  upcomingError?: boolean
  /** Every backend category, resolved for presentation (card labels/tints). */
  categories: LiveCategory[]
  /** Featured categories, ordered — rendered as chips and sheet tiles. */
  featuredCategories: LiveCategory[]
  /** Backend LIVE counts per category; null when they failed to load. */
  initialCounts: ActiveLiveCounts | null
}

const PAGE_SIZE = 20
const COUNTS_REFRESH_DEBOUNCE_MS = 1000

/** Attaches an IntersectionObserver to the returned ref; fires onTrigger when
 * it enters view and `enabled` is true (caller owns the hasMore/loading guard). */
function useSentinel(enabled: boolean, onTrigger: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onTrigger()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, onTrigger])

  return ref
}

export function LiveExplorerScreen({
  initialActive,
  initialUpcoming,
  activeError: initialActiveError = false,
  upcomingError: initialUpcomingError = false,
  categories,
  featuredCategories,
  initialCounts,
}: LiveExplorerScreenProps) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<LiveViewMode>('vivo')
  const [categoryId, setCategoryId] = useState(ALL_LIVE_CATEGORY.id)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [counts, setCounts] = useState(initialCounts)

  // Current chip, read by pagination and realtime callbacks without re-binding them.
  const categoryIdRef = useRef(ALL_LIVE_CATEGORY.id)
  // Bumped on every category switch; async results from an older generation are discarded.
  const activeGenRef = useRef(0)
  const upcomingGenRef = useRef(0)

  const [activeItems, setActiveItems] = useState(initialActive.content)
  const [activeTotal, setActiveTotal] = useState(initialActive.totalElements)
  const [activePage, setActivePage] = useState(initialActive.number)
  const [activeHasMore, setActiveHasMore] = useState(!initialActive.last)
  const [activeLoading, setActiveLoading] = useState(false)
  const [activeError, setActiveError] = useState(initialActiveError)
  const activeLoadingRef = useRef(false)

  const [upcomingItems, setUpcomingItems] = useState(initialUpcoming.content)
  const [upcomingTotal, setUpcomingTotal] = useState(initialUpcoming.totalElements)
  const [upcomingPage, setUpcomingPage] = useState(initialUpcoming.number)
  const [upcomingHasMore, setUpcomingHasMore] = useState(!initialUpcoming.last)
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [upcomingError, setUpcomingError] = useState(initialUpcomingError)
  const upcomingLoadingRef = useRef(false)

  const loadMoreActive = useCallback(async () => {
    if (activeLoadingRef.current || !activeHasMore) return
    const gen = activeGenRef.current
    activeLoadingRef.current = true
    setActiveLoading(true)
    const result = await getActiveLives(activePage + 1, PAGE_SIZE, categoryIdRef.current)
    activeLoadingRef.current = false
    setActiveLoading(false)
    // A category switch happened meanwhile — this page belongs to the old feed.
    if (gen !== activeGenRef.current) return
    if (result.ok) {
      setActiveItems((prev) => [...prev, ...result.page.content])
      setActiveTotal(result.page.totalElements)
      setActivePage(result.page.number)
      setActiveHasMore(!result.page.last)
    } else {
      setActiveHasMore(false)
    }
  }, [activeHasMore, activePage])

  const loadMoreUpcoming = useCallback(async () => {
    if (upcomingLoadingRef.current || !upcomingHasMore) return
    const gen = upcomingGenRef.current
    upcomingLoadingRef.current = true
    setUpcomingLoading(true)
    const result = await getUpcomingLives(upcomingPage + 1, PAGE_SIZE, categoryIdRef.current)
    upcomingLoadingRef.current = false
    setUpcomingLoading(false)
    if (gen !== upcomingGenRef.current) return
    if (result.ok) {
      setUpcomingItems((prev) => [...prev, ...result.page.content])
      setUpcomingTotal(result.page.totalElements)
      setUpcomingPage(result.page.number)
      setUpcomingHasMore(!result.page.last)
    } else {
      setUpcomingHasMore(false)
    }
  }, [upcomingHasMore, upcomingPage])

  // Refetches page 0 of both feeds for the new chip. Previous items stay on
  // screen (dimmed) until the matching generation resolves. Re-selecting the
  // current chip only refetches when a feed is in an error state (retry).
  async function selectCategory(nextId: string) {
    if (nextId === categoryIdRef.current && !activeError && !upcomingError) return
    categoryIdRef.current = nextId
    setCategoryId(nextId)
    const activeGen = ++activeGenRef.current
    const upcomingGen = ++upcomingGenRef.current
    setSwitching(true)

    const [activeResult, upcomingResult] = await Promise.all([
      getActiveLives(0, PAGE_SIZE, nextId),
      getUpcomingLives(0, PAGE_SIZE, nextId),
    ])

    if (activeGen === activeGenRef.current) {
      if (activeResult.ok) {
        setActiveItems(activeResult.page.content)
        setActiveTotal(activeResult.page.totalElements)
        setActivePage(activeResult.page.number)
        setActiveHasMore(!activeResult.page.last)
        setActiveError(false)
      } else {
        setActiveItems([])
        setActiveTotal(0)
        setActivePage(0)
        setActiveHasMore(false)
        setActiveError(true)
      }
    }
    if (upcomingGen === upcomingGenRef.current) {
      if (upcomingResult.ok) {
        setUpcomingItems(upcomingResult.page.content)
        setUpcomingTotal(upcomingResult.page.totalElements)
        setUpcomingPage(upcomingResult.page.number)
        setUpcomingHasMore(!upcomingResult.page.last)
        setUpcomingError(false)
      } else {
        setUpcomingItems([])
        setUpcomingTotal(0)
        setUpcomingPage(0)
        setUpcomingHasMore(false)
        setUpcomingError(true)
      }
    }
    if (activeGen === activeGenRef.current && upcomingGen === upcomingGenRef.current) setSwitching(false)
  }

  // Merges a fresh page-0 fetch into activeItems without disturbing items
  // already loaded further down via pagination (no dupes, no reordering).
  // Items from another category are dropped defensively (the backend already filters).
  const mergeFreshActive = useCallback((fresh: PageResponse<LiveFeedCardResponse>, forCategoryId: string) => {
    setActiveTotal(fresh.totalElements)
    setActiveItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id))
      const toPrepend = fresh.content.filter(
        (i) => !existingIds.has(i.id) && (forCategoryId === ALL_LIVE_CATEGORY.id || i.categoryId === forCategoryId),
      )
      return toPrepend.length === 0 ? prev : [...toPrepend, ...prev]
    })
  }, [])

  const refreshActiveFeed = useCallback(async () => {
    const gen = activeGenRef.current
    const forCategoryId = categoryIdRef.current
    const result = await getActiveLives(0, PAGE_SIZE, forCategoryId)
    if (!result.ok || gen !== activeGenRef.current) return
    mergeFreshActive(result.page, forCategoryId)
  }, [mergeFreshActive])

  // Debounced so a burst of realtime events triggers a single counts request.
  // On failure the previous counts are kept.
  const countsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshCounts = useCallback(() => {
    if (countsTimerRef.current) clearTimeout(countsTimerRef.current)
    countsTimerRef.current = setTimeout(async () => {
      countsTimerRef.current = null
      const result = await getActiveLiveCounts()
      if (result.ok) setCounts(result.counts)
    }, COUNTS_REFRESH_DEBOUNCE_MS)
  }, [])
  useEffect(
    () => () => {
      if (countsTimerRef.current) clearTimeout(countsTimerRef.current)
    },
    [],
  )

  // Latest loaded ids, read by realtime callbacks to keep the toggle totals in
  // sync without side effects inside state updaters.
  const activeIdsRef = useRef(new Set<string>())
  const upcomingIdsRef = useRef(new Set<string>())
  useEffect(() => {
    activeIdsRef.current = new Set(activeItems.map((i) => i.id))
  }, [activeItems])
  useEffect(() => {
    upcomingIdsRef.current = new Set(upcomingItems.map((i) => i.id))
  }, [upcomingItems])

  // Real-time explorer updates — global "lives-feed" RTM broadcast channel,
  // replaces polling. The channel payload is minimal (type + liveId only),
  // so on live-started we refetch page 0 rather than synthesizing a card.
  useLivesFeedChannel({
    onLiveStarted: (liveId) => {
      void refreshActiveFeed()
      refreshCounts()
      if (upcomingIdsRef.current.has(liveId)) setUpcomingTotal((total) => Math.max(0, total - 1))
      setUpcomingItems((prev) => prev.filter((i) => i.id !== liveId))
    },
    onLiveEnded: (liveId) => {
      if (activeIdsRef.current.has(liveId)) setActiveTotal((total) => Math.max(0, total - 1))
      setActiveItems((prev) => prev.filter((i) => i.id !== liveId))
      refreshCounts()
    },
    onResync: () => {
      void refreshActiveFeed()
      refreshCounts()
    },
  })

  const upcomingIds = useMemo(() => upcomingItems.map((i) => i.id), [upcomingItems])
  const reminders = useLiveReminders(upcomingIds)

  const isVivo = viewMode === 'vivo'
  const loadMore = isVivo ? loadMoreActive : loadMoreUpcoming
  const sentinelEnabled =
    !switching && (isVivo ? activeHasMore && !activeLoading : upcomingHasMore && !upcomingLoading)

  const mobileSentinelRef = useSentinel(sentinelEnabled, loadMore)
  const desktopSentinelRef = useSentinel(sentinelEnabled, loadMore)

  // Category filtering happens on the backend; text search has no backend
  // param yet, so it only applies to pages already loaded into memory.
  const filteredLives = useMemo(() => searchLives(activeItems, query), [activeItems, query])
  const filteredUpcoming = useMemo(() => searchLives(upcomingItems, query), [upcomingItems, query])

  function toggleSearch() {
    if (searchOpen) setQuery('')
    setSearchOpen((prev) => !prev)
  }

  const trimmedQuery = query.trim()
  const resultCount = isVivo ? filteredLives.length : filteredUpcoming.length
  const loadingMore = isVivo ? activeLoading : upcomingLoading
  const loadError = isVivo ? activeError : upcomingError
  const isFiltered = trimmedQuery !== '' || categoryId !== ALL_LIVE_CATEGORY.id
  const emptyMessage = isFiltered
    ? isVivo
      ? 'No encontramos lives con estos filtros.'
      : 'No encontramos programados con estos filtros.'
    : isVivo
      ? 'No hay lives en vivo ahora mismo.'
      : 'No hay lives programados por ahora.'

  const header = (
    <LivesHeader searchOpen={searchOpen} query={query} onQueryChange={setQuery} onToggleSearch={toggleSearch} />
  )
  const modeToggle = (
    <LiveModeToggle mode={viewMode} liveCount={activeTotal} upcomingCount={upcomingTotal} onChange={setViewMode} />
  )
  const categoryBar = (
    <LiveCategoryBar
      categories={featuredCategories}
      selectedId={categoryId}
      onSelect={(id) => void selectCategory(id)}
      onOpenSheet={() => setSheetOpen(true)}
    />
  )
  const resultsLine = trimmedQuery !== '' && (
    <p className="text-[13px] text-(--ink-3)">
      {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'} para &ldquo;{trimmedQuery}&rdquo;
    </p>
  )
  // While switching, the previous category's items stay visible (dimmed), so
  // empty/error states would describe the wrong feed — hide them.
  const status = !switching && (
    <>
      {loadError ? (
        <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar los lives. Intentá de nuevo más tarde.</p>
      ) : (
        resultCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>
      )}
    </>
  )
  const loadingLine = loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>
  const feedClass = switching ? 'opacity-60 pointer-events-none' : undefined

  return (
    <LiveCategoryProvider categories={categories}>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-6 flex flex-col gap-5">
          {header}
          {modeToggle}
          {categoryBar}
          {resultsLine}
          <div className={feedClass} aria-busy={switching}>
            {isVivo ? (
              <LiveNowGrid items={filteredLives} columns="grid-cols-2" />
            ) : (
              <UpcomingTimeline
                items={filteredUpcoming}
                reminders={reminders}
                idPrefix="m"
                gridColumns="grid-cols-2"
                collapsedCount={2}
              />
            )}
            {status}
            <div ref={mobileSentinelRef} className="h-1" />
            {loadingLine}
          </div>
        </div>

        <BuyerBottomNav active="lives" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="px-12 py-8 flex flex-col gap-6 w-full max-w-6xl mx-auto">
          {header}
          <div className="flex items-center gap-6">
            <div className="w-full max-w-sm shrink-0">{modeToggle}</div>
            <div className="flex-1 min-w-0">{categoryBar}</div>
          </div>
          {resultsLine}
          <div className={feedClass} aria-busy={switching}>
            {isVivo ? (
              <LiveNowGrid items={filteredLives} columns="grid-cols-4" />
            ) : (
              <UpcomingTimeline
                items={filteredUpcoming}
                reminders={reminders}
                idPrefix="d"
                gridColumns="grid-cols-4"
                collapsedCount={4}
              />
            )}
            {status}
            <div ref={desktopSentinelRef} className="h-1" />
            {loadingLine}
          </div>
        </div>
      </div>

      <LiveCategoriesSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedId={categoryId}
        onSelect={(id) => void selectCategory(id)}
        categories={featuredCategories}
        counts={counts}
      />
    </LiveCategoryProvider>
  )
}
