'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { AddProductFab } from '@/components/AddProductFab'
import { CategoryFilterDrawer, DEFAULT_CATEGORY_FILTERS } from './CategoryFilterDrawer'
import type { CategoryFilters } from './CategoryFilterDrawer'
import type { ProductView } from '@/lib/types'

const FilterIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <circle cx="4"  cy="2"  r="1.5" fill="currentColor"/>
    <path d="M7 2h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M1 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="7"  r="1.5" fill="currentColor"/>
    <path d="M1 7h9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 7h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7"  cy="12" r="1.5" fill="currentColor"/>
    <path d="M1 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

function formatPrice(price: number, currency: string): string {
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function getPrimaryImage(product: ProductView): string | null {
  const primary = product.images.find((img) => img.primary)
  return primary?.url ?? product.images[0]?.url ?? null
}

function ProductCard({ product }: { product: ProductView }) {
  const imageUrl = getPrimaryImage(product)
  const isLow = product.stock.totalQuantity > 0 && product.stock.totalQuantity <= 3

  const badge = !product.active
    ? { label: 'Inactivo', variant: '' }
    : product.paused
      ? { label: 'Pausado', variant: 'paused' }
      : isLow
        ? { label: 'Stock bajo', variant: 'low' }
        : null

  return (
    <Link
      href={`/store/stock/${product.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-(--r-xl) border border-(--line) transition-colors hover:border-white/20"
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,31,135,0.12), rgba(8,5,20,0.9))' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[32px] opacity-40">📦</span>
          </div>
        )}
      </div>
      <div className="stock-card-scrim" />
      {badge && <span className={`stock-card-badge ${badge.variant}`}>{badge.label}</span>}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
        <p className="text-[14px] font-bold text-(--ink-0) leading-snug line-clamp-2">{product.name}</p>
        <p className="text-[11px] font-bold text-brand-400">
          {formatPrice(product.basePrice, product.currency)} · {product.stock.totalQuantity} unid.
        </p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="stock-empty-icon">
        <span className="text-[40px]">📦</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[16px] font-semibold text-(--ink-0)">Sin productos en esta categoría</p>
        <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
          Agregá un producto y asignale esta categoría para verlo acá.
        </p>
      </div>
    </div>
  )
}

function CategoryContent({ products }: { products: ProductView[] }) {
  const [search, setSearch] = useState('')

  const displayed = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="flex flex-col gap-4">
      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar en esta categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : displayed.length === 0 ? (
        <p className="text-[13px] text-(--ink-3) text-center py-6">
          Sin resultados para &quot;{search}&quot;
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayed.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

type SortValue = 'none' | 'price_asc' | 'price_desc'
type StockValue = 'all' | 'critical' | 'normal'

type Props = {
  categoryName: string
  products: ProductView[]
  initialSort: SortValue
  initialStockLevel: StockValue
}

export function CategoryProductsScreen({ categoryName, products, initialSort, initialStockLevel }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<CategoryFilters>({
    sortBy: initialSort,
    inventoryStatus: initialStockLevel,
  })

  useEffect(() => {
    setFilters({ sortBy: initialSort, inventoryStatus: initialStockLevel })
  }, [initialSort, initialStockLevel])

  const hasActiveFilters =
    filters.sortBy !== DEFAULT_CATEGORY_FILTERS.sortBy ||
    filters.inventoryStatus !== DEFAULT_CATEGORY_FILTERS.inventoryStatus

  function handleApply(newFilters: CategoryFilters) {
    setFilters(newFilters)
    setFilterOpen(false)

    const params = new URLSearchParams()
    if (newFilters.sortBy === 'price_asc') params.set('sort', 'PRICE_ASC')
    else if (newFilters.sortBy === 'price_desc') params.set('sort', 'PRICE_DESC')

    if (newFilters.inventoryStatus === 'critical') params.set('stockLevel', 'CRITICAL')
    else if (newFilters.inventoryStatus === 'normal') params.set('stockLevel', 'NORMAL')

    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store/stock" className="store-back-btn text-brand-400" aria-label="Volver">
            ←
          </Link>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            {categoryName}
          </span>
          <button
            className="home-nav-icon stock-filter-icon-wrap"
            aria-label="Filtros"
            onClick={() => setFilterOpen(true)}
          >
            <FilterIcon />
            {hasActiveFilters && <span className="stock-filter-badge" />}
          </button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          <CategoryContent products={products} />
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/store/stock"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase">
            {categoryName}
          </span>
          <button
            className="home-nav-icon stock-filter-icon-wrap"
            aria-label="Filtros"
            onClick={() => setFilterOpen(true)}
          >
            <FilterIcon />
            {hasActiveFilters && <span className="stock-filter-badge" />}
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-4xl">
            <CategoryContent products={products} />
          </div>
        </div>
      </div>

      <AddProductFab />

      <CategoryFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApply}
      />
    </>
  )
}
