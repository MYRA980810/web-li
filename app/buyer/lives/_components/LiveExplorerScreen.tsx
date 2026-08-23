'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { LIVE_CATEGORIES, LIVE_ITEMS, SCHEDULED_ITEMS, type LiveCategoryId } from '@/lib/mockLives'

type CategoryFilter = 'todos' | LiveCategoryId

function textMatches(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
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

function ScheduledList({ items }: { items: typeof SCHEDULED_ITEMS }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-(--ink-3) text-center py-4">Sin programados para esta búsqueda.</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="buyer-scheduled-row">
          <div
            className="w-11 h-11 rounded-full shrink-0"
            style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-(--ink-0) truncate">{item.store}</p>
            <p className="text-[12px] font-semibold text-(--teal-400)">
              {item.day} · {item.time}
            </p>
          </div>
          <button className="buyer-scheduled-bell" aria-label="Avisarme">🔔</button>
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
  const livesHeading = searchActive
    ? trimmedQuery
      ? `Lives con "${trimmedQuery}"`
      : 'Resultados'
    : 'En vivo ahora'
  const scheduledHeading = trimmedQuery ? `Programados con "${trimmedQuery}"` : 'Próximos programados'

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
          <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
        </div>

        <div className="px-5 mt-5 flex items-center justify-between">
          <span className="font-display font-bold text-[17px] text-(--ink-0) flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]" />
            {livesHeading}
          </span>
          <span className="buyer-live-count-badge">{filteredLives.length}</span>
        </div>

        <div className="px-5 mt-3">
          <LiveGrid items={filteredLives} columns="grid-cols-2" onSelect={goToLive} />
          {filteredLives.length === 0 && (
            <p className="text-[13px] text-(--ink-3) text-center py-10">No encontramos lives para esta búsqueda.</p>
          )}
        </div>

        {searchActive && (
          <div className="px-5 mt-7 pb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-[15px] text-(--ink-0) flex items-center gap-2">
                📅 {scheduledHeading}
              </span>
              <span className="text-[12px] font-semibold text-(--ink-3)">{filteredScheduled.length}</span>
            </div>
            <ScheduledList items={filteredScheduled} />
          </div>
        )}

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
            <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
          </div>

          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-[17px] text-(--ink-0) flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]" />
                  {livesHeading}
                </span>
                <span className="buyer-live-count-badge">{filteredLives.length}</span>
              </div>
              <LiveGrid items={filteredLives} columns="grid-cols-4" onSelect={goToLive} />
              {filteredLives.length === 0 && (
                <p className="text-[13px] text-(--ink-3) text-center py-10">No encontramos lives para esta búsqueda.</p>
              )}
            </div>

            {searchActive && (
              <div className="w-80 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-[15px] text-(--ink-0) flex items-center gap-2">
                    📅 {scheduledHeading}
                  </span>
                  <span className="text-[12px] font-semibold text-(--ink-3)">{filteredScheduled.length}</span>
                </div>
                <ScheduledList items={filteredScheduled} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
