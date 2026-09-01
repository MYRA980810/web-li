'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { formatLiveCountdown } from '@/lib/mockLives'
import {
  getActiveLives,
  getUpcomingLives,
  type LiveFeedCardResponse,
  type LiveUpcomingCardResponse,
  type PageResponse,
} from '@/lib/liveActions'

type ViewMode = 'vivo' | 'proximos'

type LiveExplorerScreenProps = {
  initialActive: PageResponse<LiveFeedCardResponse>
  initialUpcoming: PageResponse<LiveUpcomingCardResponse>
  activeError?: boolean
  upcomingError?: boolean
}

// Fallback visuals for cards with no thumbnailUrl — the backend has no
// color/gradient field, so we derive a stable pick from the item id.
const FALLBACK_GRADIENTS = [
  'radial-gradient(ellipse at 50% 30%, #6b4a2a 0%, #2a1a10 60%, #120a08 100%)',
  'radial-gradient(ellipse at 50% 30%, #3a1e2e 0%, #150a12 100%)',
  'radial-gradient(ellipse at 50% 30%, #1a2a3a 0%, #0a1218 100%)',
  'radial-gradient(ellipse at 50% 30%, #4a3420 0%, #1a1208 100%)',
  'radial-gradient(ellipse at 50% 30%, #2a2a30 0%, #0e0e12 100%)',
  'radial-gradient(ellipse at 50% 30%, #1a0e2e 0%, #0a0515 100%)',
]
const FALLBACK_ACCENTS = ['var(--brand-400)', 'var(--violet-400)', 'var(--teal-400)', '#f59e0b', '#38bdf8', '#e5e7eb']

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function cardBackground(id: string, thumbnailUrl: string | null): string {
  return thumbnailUrl ? `url(${thumbnailUrl}) center/cover no-repeat` : FALLBACK_GRADIENTS[hashId(id) % FALLBACK_GRADIENTS.length]
}

function cardAccent(id: string): string {
  return FALLBACK_ACCENTS[hashId(id) % FALLBACK_ACCENTS.length]
}

function minutesUntil(scheduledAt: string): number {
  return Math.max(0, Math.round((new Date(scheduledAt).getTime() - Date.now()) / 60000))
}

function textMatches(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
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

function LiveModeToggle({
  mode,
  liveCount,
  scheduledCount,
  onChange,
}: {
  mode: ViewMode
  liveCount: number
  scheduledCount: number
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="buyer-live-mode-toggle">
      <button
        onClick={() => onChange('vivo')}
        className={`buyer-live-mode-btn${mode === 'vivo' ? ' active-live' : ''}`}
      >
        <span className="buyer-live-mode-dot" />
        En vivo
        <span className="buyer-live-mode-count">{liveCount}</span>
      </button>
      <button
        onClick={() => onChange('proximos')}
        className={`buyer-live-mode-btn${mode === 'proximos' ? ' active-proximos' : ''}`}
      >
        🕐 Próximos
        <span className="buyer-live-mode-count">{scheduledCount}</span>
      </button>
    </div>
  )
}

function LiveGrid({
  items,
  columns,
  onSelect,
}: {
  items: LiveFeedCardResponse[]
  columns: 'grid-cols-2' | 'grid-cols-4'
  onSelect: (id: string) => void
}) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div key={item.id} className="live-grid-card" onClick={() => onSelect(item.id)}>
          <div className="live-grid-card-media" style={{ background: cardBackground(item.id, item.thumbnailUrl) }} />
          <span className="absolute top-2 left-2 z-10 live-badge">
            <span className="dot" />
            Vivo
          </span>
          <span className="live-viewers-badge">👁 {item.currentViewers}</span>
          <div className="live-grid-card-overlay" />
          <div className="live-grid-card-body">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full shrink-0" style={{ background: cardAccent(item.id) }} />
              <span className="text-[13px] font-bold text-white truncate">{item.sellerName ?? 'Vendedor'}</span>
            </div>
            <span className="text-[11px] text-white/75 truncate">{item.title}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function UpcomingGrid({ items, columns }: { items: LiveUpcomingCardResponse[]; columns: 'grid-cols-2' | 'grid-cols-4' }) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div key={item.id} className="live-grid-card">
          <div className="live-grid-card-media" style={{ background: cardBackground(item.id, item.thumbnailUrl) }} />
          <span className="absolute top-2 left-2 z-10 buyer-upcoming-badge">{formatLiveCountdown(minutesUntil(item.scheduledAt))}</span>
          <button className="buyer-upcoming-bell" aria-label="Avisarme">
            🔔
          </button>
          <div className="live-grid-card-overlay" />
          <div className="live-grid-card-body">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full shrink-0" style={{ background: cardAccent(item.id) }} />
              <span className="text-[13px] font-bold text-white truncate">{item.sellerName ?? 'Vendedor'}</span>
            </div>
            <span className="buyer-upcoming-time">{item.title}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LiveExplorerScreen({ initialActive, initialUpcoming, activeError, upcomingError }: LiveExplorerScreenProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('vivo')

  const [activeItems, setActiveItems] = useState(initialActive.content)
  const [activePage, setActivePage] = useState(initialActive.number)
  const [activeHasMore, setActiveHasMore] = useState(!initialActive.last)
  const [activeLoading, setActiveLoading] = useState(false)
  const activeLoadingRef = useRef(false)

  const [upcomingItems, setUpcomingItems] = useState(initialUpcoming.content)
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
      setUpcomingPage(result.page.number)
      setUpcomingHasMore(!result.page.last)
    } else {
      setUpcomingHasMore(false)
    }
    upcomingLoadingRef.current = false
    setUpcomingLoading(false)
  }, [upcomingHasMore, upcomingPage])

  const isVivo = viewMode === 'vivo'
  const loadMore = isVivo ? loadMoreActive : loadMoreUpcoming
  const sentinelEnabled = isVivo ? activeHasMore && !activeLoading : upcomingHasMore && !upcomingLoading

  const mobileSentinelRef = useSentinel(sentinelEnabled, loadMore)
  const desktopSentinelRef = useSentinel(sentinelEnabled, loadMore)

  // Backend has no search endpoint on /active or /upcoming — this only filters
  // pages already loaded into memory, not the full remote dataset.
  const filteredLives = activeItems.filter(
    (item) => query.trim() === '' || textMatches(`${item.sellerName ?? ''} ${item.title}`, query),
  )
  const filteredScheduled = upcomingItems.filter(
    (item) => query.trim() === '' || textMatches(`${item.sellerName ?? ''} ${item.title}`, query),
  )

  function goToLive(id: string) {
    router.push(`/buyer/lives/${id}`)
  }

  function exitSearch() {
    setSearchActive(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const trimmedQuery = query.trim()
  const heading = isVivo
    ? searchActive
      ? trimmedQuery
        ? `Lives con "${trimmedQuery}"`
        : 'Resultados'
      : 'En vivo ahora'
    : searchActive
      ? trimmedQuery
        ? `Programados con "${trimmedQuery}"`
        : 'Resultados'
      : 'Próximos programados'
  const headingCount = isVivo ? filteredLives.length : filteredScheduled.length
  const emptyMessage = isVivo
    ? 'No encontramos lives para esta búsqueda.'
    : 'No encontramos programados para esta búsqueda.'
  const loadingMore = isVivo ? activeLoading : upcomingLoading
  const loadError = isVivo ? activeError : upcomingError

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-5">
          <div className={`buyer-search-bar${searchActive ? ' active' : ''}`}>
            {searchActive && (
              <button onClick={exitSearch} aria-label="Volver" className="text-(--ink-1) text-lg leading-none shrink-0">
                ←
              </button>
            )}
            <span className="shrink-0">🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchActive(true)}
              placeholder="Buscar lives o tiendas"
              className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
            />
            {searchActive && query && (
              <button onClick={() => setQuery('')} aria-label="Limpiar" className="text-(--ink-3) text-base leading-none shrink-0">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="px-5 mt-4">
          <LiveModeToggle mode={viewMode} liveCount={activeItems.length} scheduledCount={upcomingItems.length} onChange={setViewMode} />
        </div>

        <div className="px-5 mt-5 flex items-center justify-between">
          <span className="font-display font-bold text-[17px] text-(--ink-0) flex items-center gap-2">
            <span
              className={
                isVivo
                  ? 'w-2 h-2 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]'
                  : 'w-2 h-2 rounded-full bg-(--teal-400) [box-shadow:0_0_8px_var(--teal-400)]'
              }
            />
            {heading}
          </span>
          <span className="buyer-live-count-badge">{headingCount}</span>
        </div>

        <div className="px-5 mt-3">
          {isVivo ? (
            <LiveGrid items={filteredLives} columns="grid-cols-2" onSelect={goToLive} />
          ) : (
            <UpcomingGrid items={filteredScheduled} columns="grid-cols-2" />
          )}
          {loadError ? (
            <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar los lives. Intentá de nuevo más tarde.</p>
          ) : (
            headingCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>
          )}
          <div ref={mobileSentinelRef} className="h-1" />
          {loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>}
        </div>

        <BuyerBottomNav active="lives" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="px-12 py-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className={`buyer-search-bar max-w-xl${searchActive ? ' active' : ''}`}>
              {searchActive && (
                <button onClick={exitSearch} aria-label="Volver" className="text-(--ink-1) text-lg leading-none shrink-0">
                  ←
                </button>
              )}
              <span className="shrink-0">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchActive(true)}
                placeholder="Buscar lives o tiendas"
                className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
              />
              {searchActive && query && (
                <button onClick={() => setQuery('')} aria-label="Limpiar" className="text-(--ink-3) text-base leading-none shrink-0">
                  ✕
                </button>
              )}
            </div>
            <div className="max-w-[280px] w-full">
              <LiveModeToggle mode={viewMode} liveCount={activeItems.length} scheduledCount={upcomingItems.length} onChange={setViewMode} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-[17px] text-(--ink-0) flex items-center gap-2">
                <span
                  className={
                    isVivo
                      ? 'w-2 h-2 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]'
                      : 'w-2 h-2 rounded-full bg-(--teal-400) [box-shadow:0_0_8px_var(--teal-400)]'
                  }
                />
                {heading}
              </span>
              <span className="buyer-live-count-badge">{headingCount}</span>
            </div>
            {isVivo ? (
              <LiveGrid items={filteredLives} columns="grid-cols-4" onSelect={goToLive} />
            ) : (
              <UpcomingGrid items={filteredScheduled} columns="grid-cols-4" />
            )}
            {loadError ? (
            <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar los lives. Intentá de nuevo más tarde.</p>
          ) : (
            headingCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>
          )}
            <div ref={desktopSentinelRef} className="h-1" />
            {loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>}
          </div>
        </div>
      </div>
    </>
  )
}
