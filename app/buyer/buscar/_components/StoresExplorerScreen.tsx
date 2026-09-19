'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'
import { getStores } from '@/lib/buyerStoreActions'
import { toBuyerStoreView } from '@/lib/buyerViewMappers'
import { fallbackGradient, storeInitials } from '@/lib/visualFallbacks'
import type { BuyerStoreView } from '@/lib/types'
import {
  DEFAULT_STORE_FILTERS,
  StoreFiltersSheet,
  type StoreFilters,
} from './StoreFiltersSheet'

const SORT_LABELS: Record<StoreFilters['sortBy'], string> = {
  recomendadas: 'RECOMENDADAS',
  mejor_calificadas: 'MEJOR CALIFICADAS',
  mas_seguidas: 'MÁS SEGUIDAS',
  ranking: 'RANKING LIVENTO',
}

// Backend has no filter/sort query params on GET /api/stores — only
// pagination. Everything here filters/sorts the accumulated in-memory list.
function applyFilters(stores: BuyerStoreView[], query: string, filters: StoreFilters): BuyerStoreView[] {
  const q = query.trim().toLowerCase()

  let result = stores.filter((store) => {
    if (filters.minRating > 0 && store.rating < filters.minRating) return false
    if (filters.liveOnly && !store.liveNow) return false
    if (q && !store.name.toLowerCase().includes(q)) return false
    return true
  })

  result = [...result].sort((a, b) => {
    switch (filters.sortBy) {
      case 'mejor_calificadas':
        return b.rating - a.rating
      case 'mas_seguidas':
        return b.followerCount - a.followerCount
      case 'ranking': {
        if (a.rankingPosition == null && b.rankingPosition == null) return 0
        if (a.rankingPosition == null) return 1
        if (b.rankingPosition == null) return -1
        return a.rankingPosition - b.rankingPosition
      }
      default:
        return 0
    }
  })

  return result
}

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

function StoreCard({ store }: { store: BuyerStoreView }) {
  const router = useRouter()

  return (
    <div
      className="buyer-store-card"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/buyer/stores/${store.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(`/buyer/stores/${store.id}`)
      }}
    >
      <div className="buyer-store-card-avatar-wrap">
        {store.logoUrl ? (
          <div className="buyer-store-avatar">
            <Image src={store.logoUrl} alt={store.name} fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <div className="buyer-store-avatar" style={{ background: fallbackGradient(store.id) }}>
            {storeInitials(store.name)}
          </div>
        )}
        {store.liveNow && (
          <span className="live-badge buyer-store-card-live">
            <span className="dot" />
            En vivo
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-[14px] font-bold text-(--ink-0) truncate">{store.name}</span>
        <span className="text-[12px] text-(--ink-2)">
          ★ {store.rating.toFixed(1)} · {store.followerCount.toLocaleString('es-MX')} seguidores
        </span>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
        {store.rankingPosition != null && <span className="buyer-ranking-chip">#{store.rankingPosition}</span>}
        {store.liveNow ? (
          <span className="live-launch-btn text-[12px] py-2 px-4">Ver live</span>
        ) : (
          <span className="seller-ghost-sm text-[12px]">Visitar</span>
        )}
      </div>
    </div>
  )
}

type Props = {
  initialStores: BuyerStoreView[]
  initialPage: number
  initialHasMore: boolean
  loadError?: boolean
}

export function StoresExplorerScreen({ initialStores, initialPage, initialHasMore, loadError }: Props) {
  const [stores, setStores] = useState(initialStores)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadingRef = useRef(false)

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<StoreFilters>(DEFAULT_STORE_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeToggleCount = (filters.liveOnly ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoadingMore(true)
    const result = await getStores(page + 1)
    if (result.ok) {
      setStores((prev) => [...prev, ...result.page.content.map(toBuyerStoreView)])
      setPage(result.page.number)
      setHasMore(!result.page.last)
    } else {
      setHasMore(false)
    }
    loadingRef.current = false
    setLoadingMore(false)
  }, [hasMore, page])

  const sentinelEnabled = hasMore && !loadingMore
  const mobileSentinelRef = useSentinel(sentinelEnabled, loadMore)
  const desktopSentinelRef = useSentinel(sentinelEnabled, loadMore)

  const filteredStores = useMemo(() => applyFilters(stores, query, filters), [stores, query, filters])
  const liveCount = stores.filter((s) => s.liveNow).length
  const hasActiveSort = filters.sortBy !== 'recomendadas'

  function countForDraft(draft: StoreFilters) {
    return applyFilters(stores, query, draft).length
  }

  function clearAll() {
    setFilters(DEFAULT_STORE_FILTERS)
  }

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold text-[26px] tracking-[-0.02em] text-(--ink-0)">Tiendas</h1>
          <p className="text-[12px] text-(--ink-3) mt-1">
            {stores.length} tiendas · {liveCount} transmitiendo ahora
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="buyer-search-bar flex-1">
          <span className="shrink-0">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tienda"
            className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
          />
        </div>
        <button className="buyer-icon-btn" style={{ width: 46, height: 46 }} onClick={() => setSheetOpen(true)} aria-label="Filtros">
          🎚
          {activeToggleCount > 0 && <span className="buyer-icon-btn-badge">{activeToggleCount}</span>}
        </button>
      </div>

      {hasActiveSort && (
        <div className="flex items-center gap-3">
          <span className="stock-filter-chip selected !cursor-default">
            {sortOptionLabel(filters.sortBy)}
            <button
              className="ml-1"
              aria-label="Quitar filtro de orden"
              onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'recomendadas' }))}
            >
              ✕
            </button>
          </span>
          <button className="text-[12px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors" onClick={clearAll}>
            Limpiar
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-(--ink-2)">{filteredStores.length} tiendas</span>
        <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3)">{SORT_LABELS[filters.sortBy]}</span>
      </div>

      {loadError && stores.length === 0 ? (
        <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar las tiendas. Intentá de nuevo más tarde.</p>
      ) : filteredStores.length === 0 ? (
        <p className="text-[13px] text-(--ink-3) text-center py-10">No encontramos tiendas para estos filtros.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-5 pb-2 reveal d1">
          {content}
          <div ref={mobileSentinelRef} className="h-1" />
          {loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>}
        </div>
        <BuyerBottomNav active="buscar" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-2xl">
            {content}
            <div ref={desktopSentinelRef} className="h-1" />
            {loadingMore && <p className="text-[12px] text-(--ink-3) text-center py-4">Cargando más...</p>}
          </div>
        </div>
      </div>

      <StoreFiltersSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next)
          setSheetOpen(false)
        }}
        countForDraft={countForDraft}
      />
    </>
  )
}

function sortOptionLabel(sortBy: StoreFilters['sortBy']): string {
  const labels: Record<StoreFilters['sortBy'], string> = {
    recomendadas: 'Recomendadas',
    mejor_calificadas: 'Mejor calificadas',
    mas_seguidas: 'Más seguidas',
    ranking: 'Ranking Livento',
  }
  return labels[sortBy]
}
