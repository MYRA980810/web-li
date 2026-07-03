'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { ProductView, VariantView, Category } from '@/lib/types'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export function getPrimaryImage(product: ProductView): string | null {
  const primary = product.images.find((img) => img.primary)
  return primary?.url ?? product.images[0]?.url ?? null
}

export function defaultVariant(product: ProductView): VariantView | null {
  return product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null
}

// Only products with an active, sellable, in-stock default variant can be
// added to a live — matches the backend's AddCatalogProductRequest contract.
export function isSelectable(product: ProductView): boolean {
  if (!product.active || product.paused) return false
  const variant = defaultVariant(product)
  return !!variant && variant.stock.availableQuantity > 0
}

type ProductCardProps = {
  product: ProductView
  selected: boolean
  onToggle: (id: string) => void
}

function ProductCard({ product, selected, onToggle }: ProductCardProps) {
  const imageUrl = getPrimaryImage(product)
  const variant = defaultVariant(product)
  const price = variant?.effectivePrice ?? product.basePrice

  return (
    <button
      type="button"
      className={`live-picker-card${selected ? ' selected' : ''}`}
      onClick={() => onToggle(product.id)}
      aria-pressed={selected}
    >
      <div className="live-picker-card-img-wrap">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[28px] opacity-40">📦</div>
        )}
        <span className={`live-picker-checkbox${selected ? ' checked' : ''}`} aria-hidden="true">
          {selected && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.2 3.2L11 1" stroke="#1a0612" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="live-picker-price-badge">{formatPrice(price)}</span>
      </div>
      <div className="live-picker-card-body">
        <p className="live-picker-card-name">{product.name}</p>
        <p className="live-picker-card-sub">{product.categoryName ?? 'Sin categoría'}</p>
      </div>
    </button>
  )
}

export type StockProductPickerProps = {
  products: ProductView[]
  categories: Category[]
  selected: Set<string>
  onToggle: (id: string) => void
}

export function StockProductPicker({ products, categories, selected, onToggle }: StockProductPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const eligible = useMemo(() => products.filter(isSelectable), [products])

  const displayed = useMemo(() => {
    return eligible.filter((p) => {
      const matchesCategory = !activeCategory || p.categoryId === activeCategory
      const matchesSearch = !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [eligible, activeCategory, search])

  const categoryTabs = [{ id: null as string | null, name: 'Todo el Stock' }, ...categories.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <div className="flex flex-col gap-4">
      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar en tu inventario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id ?? 'all'}
            type="button"
            className={`category-pill${activeCategory === tab.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(tab.id)}
            aria-pressed={activeCategory === tab.id}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="text-[13px] text-(--ink-3) text-center py-10">
          {eligible.length === 0
            ? 'No tenés productos disponibles para agregar a un live.'
            : `Sin resultados para "${search}"`}
        </p>
      ) : (
        <div className="live-picker-grid">
          {displayed.map((p) => (
            <ProductCard key={p.id} product={p} selected={selected.has(p.id)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
