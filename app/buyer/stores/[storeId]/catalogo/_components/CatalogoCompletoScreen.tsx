'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { BuyerProductCard } from '@/components/BuyerProductCard'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import type { BuyerProductCardView, BuyerStoreView } from '@/lib/types'

type CatalogSort = 'destacados' | 'en_vivo' | 'mejor_valorado' | 'precio'

function buildCategoryOptions(products: BuyerProductCardView[]) {
  const byCategory = new Map<string, number>()
  for (const p of products) {
    const key = p.category ?? 'Otros'
    byCategory.set(key, (byCategory.get(key) ?? 0) + 1)
  }
  return Array.from(byCategory.entries()).map(([name, count]) => ({ name, count }))
}

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'en_vivo', label: 'En vivo' },
  { value: 'mejor_valorado', label: 'Mejor valorado' },
  { value: 'precio', label: 'Precio' },
]

type Props = { store: BuyerStoreView | null; products: BuyerProductCardView[] }

export function CatalogoCompletoScreen({ store, products }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todo')
  const [sort, setSort] = useState<CatalogSort>('destacados')
  const { count: cartCount } = useCart()

  const categories = useMemo(() => buildCategoryOptions(products), [products])

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== 'todo' && (p.category ?? 'Otros') !== category) return false
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
      return true
    })
    if (sort === 'en_vivo') result = result.filter((p) => p.isLive)
    if (sort === 'mejor_valorado') result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'precio') result = [...result].sort((a, b) => a.price - b.price)
    return result
  }, [products, category, search, sort])

  if (!store) {
    return (
      <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
        <span className="text-[48px] opacity-40">🏬</span>
        <p className="text-[18px] font-semibold text-(--ink-0)">Tienda no encontrada</p>
        <Link href="/buyer/buscar" className="live-launch-btn text-[14px]">Volver a Tiendas</Link>
      </div>
    )
  }

  const content = (
    <div className="flex flex-col gap-4">
      <div className="buyer-search-bar">
        <span className="shrink-0">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto, talla o color"
          className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button className={`category-pill${category === 'todo' ? ' active' : ''}`} onClick={() => setCategory('todo')}>
          Todo {products.length}
        </button>
        {categories.map((c) => (
          <button key={c.name} className={`category-pill${category === c.name ? ' active' : ''}`} onClick={() => setCategory(c.name)}>
            {c.name} {c.count}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-(--ink-3)">🎚</span>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`category-pill${sort === opt.value ? ' active' : ''}`}
              onClick={() => setSort(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-(--ink-2)">
          {filtered.length} productos en <span className="font-semibold text-(--ink-0)">{category === 'todo' ? 'Todo el catálogo' : category}</span>
        </span>
        <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3)">{sort.replace('_', ' ').toUpperCase()}</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-(--ink-3) text-center py-10">Sin productos para este filtro.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-2">
          {filtered.map((p) => (
            <BuyerProductCard key={p.id} product={p} />
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
        <div className="buyer-store-top-bar">
          <button onClick={() => router.back()} className="buyer-icon-btn" aria-label="Volver">←</button>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display font-bold text-[15px] text-(--ink-0)">Catálogo completo</span>
            <span className="text-[11px] text-(--ink-3)">{store.name} · {products.length} productos</span>
          </div>
          <button className="buyer-icon-btn" aria-label="Opciones">☰</button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">{content}</div>

        <div className="buyer-sticky-footer">
          <button className="live-launch-btn flex-1 justify-center">Ver los productos del live</button>
          <button onClick={() => router.push('/buyer/cart')} className="buyer-icon-btn" aria-label="Carrito">
            🛒
            <span className="buyer-icon-btn-badge">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="buyer-store-top-bar !px-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">← Volver</button>
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-[15px] text-(--ink-0)">Catálogo completo</span>
            <span className="text-[11px] text-(--ink-3)">{store.name} · {products.length} productos</span>
          </div>
          <button onClick={() => router.push('/buyer/cart')} className="buyer-icon-btn" aria-label="Carrito">
            🛒
            <span className="buyer-icon-btn-badge">{cartCount}</span>
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-3xl">{content}</div>
        </div>
      </div>
    </>
  )
}
