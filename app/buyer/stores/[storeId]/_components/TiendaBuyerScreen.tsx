'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { BuyerProductCard } from '@/components/BuyerProductCard'
import { fallbackGradient, storeInitials } from '@/lib/visualFallbacks'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import { getStoreReviews, type StoreReviewResponse } from '@/lib/buyerStoreActions'
import type { BuyerProductCardView, BuyerStoreView } from '@/lib/types'

type ProductSort = 'destacados' | 'en_vivo' | 'mejor_valorados'
type StoreTab = 'catalogo' | 'resenas'

function buildCategoryCounts(products: BuyerProductCardView[]) {
  const byCategory = new Map<string, number>()
  for (const p of products) {
    const key = p.category ?? 'Otros'
    byCategory.set(key, (byCategory.get(key) ?? 0) + 1)
  }
  return Array.from(byCategory.entries()).map(([name, count]) => ({ name, count }))
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">🏬</span>
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold text-(--ink-0)">Tienda no encontrada</p>
        <p className="text-[14px] text-(--ink-3)">Esta tienda ya no está disponible.</p>
      </div>
      <Link href="/buyer/buscar" className="live-launch-btn text-[14px]">Volver a Tiendas</Link>
    </div>
  )
}

function StoreHeader({ store }: { store: BuyerStoreView }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <div className="buyer-store-card-avatar-wrap shrink-0">
          {store.logoUrl ? (
            <div className="buyer-store-avatar" style={{ width: 76, height: 76, fontSize: 24 }}>
              <Image src={store.logoUrl} alt={store.name} fill sizes="76px" className="object-cover" />
            </div>
          ) : (
            <div className="buyer-store-avatar" style={{ width: 76, height: 76, fontSize: 24, background: fallbackGradient(store.id) }}>
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
        <div className="flex flex-col gap-1 min-w-0 pt-1">
          <span className="font-display font-bold text-[19px] text-(--ink-0) truncate">{store.name}</span>
          {store.description && <span className="text-[12px] text-(--ink-3) line-clamp-2">{store.description}</span>}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="product-detail-stat-card">
          <span className="product-detail-stat-value">★ {store.rating.toFixed(1)}</span>
          <span className="product-detail-stat-label">{store.reviewCount.toLocaleString('es-MX')} reseñas</span>
        </div>
        <div className="product-detail-stat-card">
          <span className="product-detail-stat-value">{(store.followerCount / 1000).toFixed(1)}k</span>
          <span className="product-detail-stat-label">seguidores</span>
        </div>
      </div>

      {store.rankingPosition != null && (
        <div className="buyer-ranking-banner">
          <div className="buyer-ranking-trophy">🏆</div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="eyebrow text-[10px]">Ranking Livento</span>
            <span className="text-[14px] font-bold text-(--ink-0)">#{store.rankingPosition}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button className="buyer-follow-btn flex-1">
          <span>Seguir tienda</span>
          <span className="text-[10px] font-semibold opacity-80">{(store.followerCount / 1000).toFixed(1)}K SEGUIDORES</span>
        </button>
        <button className="buyer-message-btn flex-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            Mensaje
          </span>
          <span className="text-[10px] font-semibold text-[#4ade80]">RESPONDE ~5 MIN</span>
        </button>
      </div>
    </div>
  )
}

function CatalogTab({ store, products }: { store: BuyerStoreView; products: BuyerProductCardView[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todo')
  const [sort, setSort] = useState<ProductSort>('destacados')

  const categories = useMemo(() => buildCategoryCounts(products), [products])

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== 'todo' && (p.category ?? 'Otros') !== category) return false
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
      return true
    })
    if (sort === 'en_vivo') result = result.filter((p) => p.isLive)
    if (sort === 'mejor_valorados') result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [products, category, search, sort])

  return (
    <div className="flex flex-col gap-4">
      <div className="buyer-search-bar">
        <span className="shrink-0">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar en ${store.name}`}
          className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 w-[68px] shrink-0">
          <button
            className={`buyer-category-sidebar-item${category === 'todo' ? ' active' : ''}`}
            onClick={() => setCategory('todo')}
          >
            <span>Todo</span>
            <span className="buyer-category-sidebar-count">{products.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              className={`buyer-category-sidebar-item${category === c.name ? ' active' : ''}`}
              onClick={() => setCategory(c.name)}
            >
              <span>{c.name}</span>
              <span className="buyer-category-sidebar-count">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button className={`category-pill${sort === 'destacados' ? ' active' : ''}`} onClick={() => setSort('destacados')}>Destacados</button>
            <button className={`category-pill${sort === 'en_vivo' ? ' active' : ''}`} onClick={() => setSort('en_vivo')}>En vivo</button>
            <button className={`category-pill${sort === 'mejor_valorados' ? ' active' : ''}`} onClick={() => setSort('mejor_valorados')}>Mejor valorados</button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-[13px] text-(--ink-3) text-center py-10">Sin productos para este filtro.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <BuyerProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <Link
            href={`/buyer/stores/${store.id}/catalogo`}
            className="text-[13px] font-semibold text-brand-400 hover:text-brand-300 transition-colors text-center py-2"
          >
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReviewsTab({ storeId }: { storeId: string }) {
  const [reviews, setReviews] = useState<StoreReviewResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getStoreReviews(storeId, 0, 20).then((result) => {
      if (cancelled) return
      if (result.ok) setReviews(result.page.content)
      else setError(true)
    })
    return () => {
      cancelled = true
    }
  }, [storeId])

  if (error) {
    return <p className="text-[13px] text-red-400 text-center py-10">No pudimos cargar las reseñas.</p>
  }

  if (reviews === null) {
    return <p className="text-[13px] text-(--ink-3) text-center py-10">Cargando reseñas...</p>
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="text-[40px] opacity-40">⭐</span>
        <p className="text-[13px] text-(--ink-3)">Todavía no hay reseñas para esta tienda.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r, idx) => (
        <div key={idx} className="buyer-checkout-result-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold text-(--ink-0)">
              {r.anonymous ? 'Comprador anónimo' : r.buyerDisplayName ?? 'Comprador'}
            </span>
            <span className="text-[11px] text-(--ink-3)">{new Date(r.createdAt).toLocaleDateString('es-MX')}</span>
          </div>
          {r.comment && <p className="text-[13px] text-(--ink-2)">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}

type Props = { store: BuyerStoreView | null; products: BuyerProductCardView[] }

export function TiendaBuyerScreen({ store, products }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<StoreTab>('catalogo')
  const { count: cartCount } = useCart()

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="buyer-store-top-bar">
          <button onClick={() => router.back()} className="buyer-icon-btn" aria-label="Volver">←</button>
          <div className="flex items-center gap-2">
            <button className="buyer-icon-btn" aria-label="Expandir">↗</button>
            <button onClick={() => router.push('/buyer/cart')} className="buyer-icon-btn" aria-label="Carrito">
              🛒
              <span className="buyer-icon-btn-badge">{cartCount}</span>
            </button>
          </div>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1 flex flex-col gap-5">
          {store ? (
            <>
              <StoreHeader store={store} />
              <div className="tab-row">
                <button className={`tab-btn${tab === 'catalogo' ? ' active' : ''}`} onClick={() => setTab('catalogo')}>Catálogo</button>
                <button className={`tab-btn${tab === 'resenas' ? ' active' : ''}`} onClick={() => setTab('resenas')}>Reseñas</button>
              </div>
              {tab === 'catalogo' ? <CatalogTab store={store} products={products} /> : <ReviewsTab key={store.id} storeId={store.id} />}
            </>
          ) : (
            <NotFound />
          )}
        </div>

        <div className="h-8" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="buyer-store-top-bar !px-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">← Volver</button>
          <button onClick={() => router.push('/buyer/cart')} className="buyer-icon-btn" aria-label="Carrito">
            🛒
            <span className="buyer-icon-btn-badge">{cartCount}</span>
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-3xl flex flex-col gap-5">
            {store ? (
              <>
                <StoreHeader store={store} />
                <div className="tab-row max-w-xs">
                  <button className={`tab-btn${tab === 'catalogo' ? ' active' : ''}`} onClick={() => setTab('catalogo')}>Catálogo</button>
                  <button className={`tab-btn${tab === 'resenas' ? ' active' : ''}`} onClick={() => setTab('resenas')}>Reseñas</button>
                </div>
                {tab === 'catalogo' ? <CatalogTab store={store} products={products} /> : <ReviewsTab key={store.id} storeId={store.id} />}
              </>
            ) : (
              <NotFound />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
