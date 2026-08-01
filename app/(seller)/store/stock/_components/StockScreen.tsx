'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { AddProductFab } from '@/components/AddProductFab'
import type { ProductView, Category } from '@/lib/types'

function getPrimaryImage(product: ProductView): string | null {
  const primary = product.images.find((img) => img.primary)
  return primary?.url ?? product.images[0]?.url ?? null
}

type CategoryTile = {
  id: string
  name: string
  count: number
  imageUrl: string | null
}

function buildCategoryTiles(products: ProductView[], categories: Category[]): CategoryTile[] {
  const knownCategoryIds = new Set(categories.map((c) => c.id))

  const tiles = categories
    .map((category) => {
      const items = products.filter((p) => p.categoryId === category.id)
      return {
        id: category.id,
        name: category.name,
        count: items.length,
        imageUrl: items.length > 0 ? getPrimaryImage(items[0]!) : null,
      }
    })
    .filter((tile) => tile.count > 0)

  // Falls back here for products with no category AND for products whose
  // categoryId doesn't match any known category (e.g. categories failed to load) —
  // otherwise those products silently vanish from the screen instead of listing.
  const uncategorized = products.filter((p) => !p.categoryId || !knownCategoryIds.has(p.categoryId))
  if (uncategorized.length > 0) {
    tiles.push({
      id: 'uncategorized',
      name: 'Sin categoría',
      count: uncategorized.length,
      imageUrl: getPrimaryImage(uncategorized[0]!),
    })
  }

  return tiles
}

function CategoryCard({ tile }: { tile: CategoryTile }) {
  return (
    <Link
      href={`/store/stock/category/${tile.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-(--r-xl) border border-(--line) transition-colors hover:border-white/20"
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,31,135,0.12), rgba(8,5,20,0.9))' }}>
        {tile.imageUrl ? (
          <Image
            src={tile.imageUrl}
            alt={tile.name}
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
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
        <p className="text-[15px] font-bold text-(--ink-0) leading-snug">{tile.name}</p>
        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-[0.08em]">
          {tile.count} {tile.count === 1 ? 'producto' : 'productos'}
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
        <p className="text-[16px] font-semibold text-(--ink-0)">Tu stock está vacío</p>
        <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
          Agregá tu primer producto y empezá a vender en tu próximo Live.
        </p>
      </div>
    </div>
  )
}

function StockContent({ products, categories }: { products: ProductView[]; categories: Category[] }) {
  const [search, setSearch] = useState('')
  const totalUnits = products.reduce((sum, p) => sum + p.stock.totalQuantity, 0)

  const tiles = buildCategoryTiles(products, categories)
  const displayed = search.trim()
    ? tiles.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : tiles

  return (
    <div className="flex flex-col gap-4">
      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar categorías..."
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayed.map((tile) => (
            <CategoryCard key={tile.id} tile={tile} />
          ))}
        </div>
      )}
    </div>
  )
}

type Props = {
  products: ProductView[]
  categories: Category[]
}

export function StockScreen({ products, categories }: Props) {
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
          <div className="w-8" />
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          <StockContent products={products} categories={categories} />
        </div>

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
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-4xl">
            <StockContent products={products} categories={categories} />
          </div>
        </div>
      </div>

      <AddProductFab />
    </>
  )
}
