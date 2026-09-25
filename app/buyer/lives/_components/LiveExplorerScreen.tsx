'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { useLivesFeedChannel } from '@/hooks/useLivesFeedChannel'
import { useLiveReminders } from '@/hooks/useLiveReminders'
import { ALL_LIVE_CATEGORY } from '@/lib/liveCategoryMock'
import {
  getActiveLives,
  getUpcomingLives,
  type LiveFeedCardResponse,
  type LiveUpcomingCardResponse,
  type PageResponse,
} from '@/lib/liveActions'
import { countLivesByCategory, filterLives } from '../_lib/livesView'
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
}

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

export function LiveExplorerScreen({ initialActive, initialUpcoming, activeError, upcomingError }: LiveExplorerScreenProps) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<LiveViewMode>('vivo')
  const [categoryId, setCategoryId] = useState(ALL_LIVE_CATEGORY.id)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [activeItems, setActiveItems] = useState(initialActive.content)
  const [activeTotal, setActiveTotal] = useState(initialActive.totalElements)
  const [activePage, setActivePage] = useState(initialActive.number)
  const [activeHasMore, setActiveHasMore] = useState(!initialActive.last)
  const [activeLoading, setActiveLoading] = useState(false)
  const activeLoadingRef = useRef(false)

  const [upcomingItems, setUpcomingItems] = useState(initialUpcoming.content)
  const [upcomingTotal, setUpcomingTotal] = useState(initialUpcoming.totalElements)
  const [upcomingPage, setUpcomingPage] = useState(initialUpcoming.number)
  const [upcomingHasMore, setUpcomingHasMore] = useState(!initialUpcoming.last)
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const upcomingLoadingRef = useRef(false)

  const loadMoreActive = useCallback(async () => {
    if (activeLoadingRef.current || !activeHasMore) return
    activeLoadingRef.current = true
    setActiveLoading(true)
    const result = await getActiveLives(activePage + 1)
    if (result.ok) {
      setActiveItems((prev) => [...prev, ...result.page.content])
      setActiveTotal(result.page.totalElements)
      setActivePage(result.page.number)
      setActiveHasMore(!result.page.last)
    } else {
      setActiveHasMore(false)
    }
    activeLoadingRef.current = false
    setActiveLoading(false)
  }, [activeHasMore, activePage])

  const loadMoreUpcoming = useCallback(async () => {
    if (upcomingLoadingRef.current || !upcomingHasMore) return
    upcomingLoadingRef.current = true
    setUpcomingLoading(true)
    const result = await getUpcomingLives(upcomingPage + 1)
    if (result.ok) {
      setUpcomingItems((prev) => [...prev, ...result.page.content])
      setUpcomingTotal(result.page.totalElements)
      setUpcomingPage(result.page.number)
      setUpcomingHasMore(!result.page.last)
    } else {
      setUpcomingHasMore(false)
    }
    upcomingLoadingRef.current = false
    setUpcomingLoading(false)
  }, [upcomingHasMore, upcomingPage])

  // Merges a fresh page-0 fetch into activeItems without disturbing items
  // already loaded further down via pagination (no dupes, no reordering).
  const mergeFreshActive = useCallback((fresh: PageResponse<LiveFeedCardResponse>) => {
    setActiveTotal(fresh.totalElements)
    setActiveItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id))
      const toPrepend = fresh.content.filter((i) => !existingIds.has(i.id))
      return toPrepend.length === 0 ? prev : [...toPrepend, ...prev]
    })
  }, [])

  const refreshActiveFeed = useCallback(async () => {
    const result = await getActiveLives(0)
    if (result.ok) mergeFreshActive(result.page)
  }, [mergeFreshActive])

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
      if (upcomingIdsRef.current.has(liveId)) setUpcomingTotal((total) => Math.max(0, total - 1))
      setUpcomingItems((prev) => prev.filter((i) => i.id !== liveId))
    },
    onLiveEnded: (liveId) => {
      if (activeIdsRef.current.has(liveId)) setActiveTotal((total) => Math.max(0, total - 1))
      setActiveItems((prev) => prev.filter((i) => i.id !== liveId))
    },
    onResync: () => {
      void refreshActiveFeed()
    },
  })

  const upcomingIds = useMemo(() => upcomingItems.map((i) => i.id), [upcomingItems])
  const reminders = useLiveReminders(upcomingIds)

  const isVivo = viewMode === 'vivo'
  const loadMore = isVivo ? loadMoreActive : loadMoreUpcoming
  const sentinelEnabled = isVivo ? activeHasMore && !activeLoading : upcomingHasMore && !upcomingLoading

  const mobileSentinelRef = useSentinel(sentinelEnabled, loadMore)
  const desktopSentinelRef = useSentinel(sentinelEnabled, loadMore)

  // Backend has no search/category params on /active or /upcoming — filtering
  // only applies to pages already loaded into memory.
  const filteredLives = useMemo(() => filterLives(activeItems, query, categoryId), [activeItems, query, categoryId])
  const filteredUpcoming = useMemo(() => filterLives(upcomingItems, query, categoryId), [upcomingItems, query, categoryId])
  const liveCounts = useMemo(() => countLivesByCategory(activeItems), [activeItems])
  const upcomingCounts = useMemo(() => countLivesByCategory(upcomingItems), [upcomingItems])

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
    <LiveCategoryBar selectedId={categoryId} onSelect={setCategoryId} onOpenSheet={() => setSheetOpen(true)} />
  )
  const resultsLine = trimmedQuery !== '' && (
    <p className="text-[13px] text-(--ink-3)">
      {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'} para &ldquo;{trimmedQuery}&rdquo;
    </p>
  )
  const status = (
    <>
      {loadError ? (
        <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar los lives. Intentá de nuevo más tarde.</p>
      ) : (
        resultCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>
      )}
    </>
  )
  const loadingLine = loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-6 flex flex-col gap-5">
          {header}
          {modeToggle}
          {categoryBar}
          {resultsLine}
          <div>
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
          <div>
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
        onSelect={setCategoryId}
        liveCounts={liveCounts}
        upcomingCounts={upcomingCounts}
      />
    </>
  )
}
