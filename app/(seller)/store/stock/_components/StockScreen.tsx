'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { StockFilterDrawer, DEFAULT_FILTERS } from './StockFilterDrawer'
import type { StockFilters } from './StockFilterDrawer'
import type { ProductView, Category } from '@/lib/types'

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

function ProductRow({ product }: { product: ProductView }) {
  const imageUrl = getPrimaryImage(product)
  const isLow = product.stock.totalQuantity > 0 && product.stock.totalQuantity <= 3

  return (
    <Link href={`/store/stock/${product.id}`} className="stock-product-item group" style={{ textDecoration: 'none' }}>
      <div className="stock-product-thumb" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,31,135,0.12), rgba(8,5,20,0.9))' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[24px] opacity-50">📦</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-(--ink-0) leading-snug">{product.name}</p>
        <p className="text-[13px] font-bold text-brand-400">
          {formatPrice(product.basePrice, product.currency)}
        </p>
        <div className={`flex items-center gap-1.5 mt-0.5 ${isLow ? 'stock-low-warning' : 'text-(--ink-3)'}`}>
          {!product.active ? (
            <span className="text-[12px] font-medium text-(--ink-3)">Inactivo</span>
          ) : isLow ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M6 4.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="text-[12px] font-medium">{product.stock.totalQuantity} unidades (Stock bajo)</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 5h4M4 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] font-medium">{product.stock.totalQuantity} unidades en stock</span>
            </>
          )}
        </div>
      </div>
      <span className="text-(--ink-3) group-hover:text-(--ink-1) transition-colors flex-shrink-0 px-1 text-[16px] leading-none">
        ›
      </span>
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
        <p className="text-[16px] font-semibold text-(--ink-0)">Tu stock está vacío</p>
        <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
          Agregá tu primer producto y empezá a vender en tu próximo Live.
        </p>
      </div>
    </div>
  )
}

function StockContent({ products }: { products: ProductView[] }) {
  const [search, setSearch] = useState('')
  const totalUnits = products.reduce((sum, p) => sum + p.stock.totalQuantity, 0)

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
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="stock-stats-card">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px]">📦</span>
          <span className="text-[14px] font-semibold text-(--ink-0)">Inventario Total</span>
        </div>
        <span className="stock-count-badge">{totalUnits} UNIDADES</span>
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : displayed.length === 0 ? (
        <p className="text-[13px] text-(--ink-3) text-center py-6">
          Sin resultados para &quot;{search}&quot;
        </p>
      ) : (
        <div className="flex flex-col">
          {displayed.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

type Props = {
  products: ProductView[]
  categories: Category[]
  initialFilters: StockFilters
}

export function StockScreen({ products, categories, initialFilters }: Props) {
  const router = useRouter()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<StockFilters>(initialFilters)

  // Sync filter state when server re-renders with new URL params
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters.sortBy, initialFilters.categoryId, initialFilters.inventoryStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters =
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.categoryId !== null ||
    filters.inventoryStatus !== DEFAULT_FILTERS.inventoryStatus

  function handleApply(newFilters: StockFilters) {
    setFilters(newFilters)
    setFilterOpen(false)

    const params = new URLSearchParams()
    if (newFilters.sortBy === 'price_asc') params.set('sort', 'PRICE_ASC')
    else if (newFilters.sortBy === 'price_desc') params.set('sort', 'PRICE_DESC')

    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId)

    if (newFilters.inventoryStatus === 'critical') params.set('stockLevel', 'CRITICAL')
    else if (newFilters.inventoryStatus === 'normal') params.set('stockLevel', 'NORMAL')

    const qs = params.toString()
    router.push(`/store/stock${qs ? `?${qs}` : ''}`)
  }

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store" className="store-back-btn text-brand-400" aria-label="Volver">
            ←
          </Link>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            Mi Stock
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
          <StockContent products={products} />
        </div>

        <button
          className="stock-fab"
          aria-label="Agregar producto"
          onClick={() => router.push('/store/products/new')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 1v16M1 9h16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/store"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase">
            Mi Stock
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
          <div className="w-full max-w-md">
            <StockContent products={products} />
          </div>
        </div>
      </div>

      <StockFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={handleApply}
        availableCategories={categories}
      />
    </>
  )
}
