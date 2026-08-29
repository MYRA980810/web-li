'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { LIVE_CATEGORIES, LIVE_ITEMS, SCHEDULED_ITEMS, formatLiveCountdown, type LiveCategoryId } from '@/lib/mockLives'

type CategoryFilter = 'todos' | LiveCategoryId
type ViewMode = 'vivo' | 'proximos'

function textMatches(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
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

function CategoryChips({
  active,
  onSelect,
}: {
  active: CategoryFilter
  onSelect: (id: CategoryFilter) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {LIVE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`category-pill${active === cat.id ? ' active' : ''}`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}

function LiveGrid({
  items,
  columns,
  onSelect,
}: {
  items: typeof LIVE_ITEMS
  columns: 'grid-cols-2' | 'grid-cols-4'
  onSelect: (id: string) => void
}) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div key={item.id} className="live-grid-card" onClick={() => onSelect(item.id)}>
          <div className="live-grid-card-media" style={{ background: item.bg }} />
          <span className="absolute top-2 left-2 z-10 live-badge">
            <span className="dot" />
            Vivo
          </span>
          <span className="live-viewers-badge">👁 {item.viewers}</span>
          <div className="live-grid-card-overlay" />
          <div className="live-grid-card-body">
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/60">{item.categoryLabel}</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[13px] font-bold text-white truncate">{item.storeShort}</span>
            </div>
            <span className="text-[11px] text-white/75 truncate">{item.product}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function UpcomingGrid({
  items,
  columns,
}: {
  items: typeof SCHEDULED_ITEMS
  columns: 'grid-cols-2' | 'grid-cols-4'
}) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div key={item.id} className="live-grid-card">
          <div className="live-grid-card-media" style={{ background: item.bg }} />
          <span className="absolute top-2 left-2 z-10 buyer-upcoming-badge">
            {formatLiveCountdown(item.minutesUntilStart)}
          </span>
          <button className="buyer-upcoming-bell" aria-label="Avisarme">
            🔔
          </button>
          <div className="live-grid-card-overlay" />
          <div className="live-grid-card-body">
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/60">{item.categoryLabel}</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[13px] font-bold text-white truncate">{item.store}</span>
            </div>
            <span className="buyer-upcoming-time">
              {item.day} · {item.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LiveExplorerScreen() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos')
  const [viewMode, setViewMode] = useState<ViewMode>('vivo')

  const filteredLives = LIVE_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'todos' || item.category === activeCategory
    const matchesText = query.trim() === '' || textMatches(`${item.store} ${item.product}`, query)
    return matchesCategory && matchesText
  })

  const filteredScheduled = SCHEDULED_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'todos' || item.category === activeCategory
    const matchesText = query.trim() === '' || textMatches(item.store, query)
    return matchesCategory && matchesText
  })

  function goToLive(id: string) {
    router.push(`/buyer/lives/${id}`)
  }

  function exitSearch() {
    setSearchActive(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const trimmedQuery = query.trim()
  const isVivo = viewMode === 'vivo'
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
          <LiveModeToggle
            mode={viewMode}
            liveCount={LIVE_ITEMS.length}
            scheduledCount={SCHEDULED_ITEMS.length}
            onChange={setViewMode}
          />
        </div>

        <div className="px-5 mt-4">
          <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
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
          {headingCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>}
        </div>

        <BuyerBottomNav active="lives" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="px-12 py-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
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
                <LiveModeToggle
                  mode={viewMode}
                  liveCount={LIVE_ITEMS.length}
                  scheduledCount={SCHEDULED_ITEMS.length}
                  onChange={setViewMode}
                />
              </div>
            </div>
            <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
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
            {headingCount === 0 && <p className="text-[13px] text-(--ink-3) text-center py-10">{emptyMessage}</p>}
          </div>
        </div>
      </div>
    </>
  )
}
