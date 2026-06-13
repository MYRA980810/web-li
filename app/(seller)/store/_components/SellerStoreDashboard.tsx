'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import type { StoreResponse } from '@/lib/storeActions'

export type ProductItem = {
  id: string
  name: string
  basePrice: number
  currency: string
  images: { id: string; url: string; primary: boolean }[]
  variants: { stock: { totalQuantity: number } }[]
}

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',   active: false, href: '/home' },
  { icon: '🛍',  label: 'Store',  active: true,  href: '/store' },
  { icon: null,  label: 'Live',   active: false, isLive: true },
  { icon: '💰',  label: 'Ventas', active: false, href: null },
  { icon: '👤',  label: 'Perfil', active: false, href: null },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.isLive ? (
          <button key="live" className="bottom-nav-live" aria-label="Live">⚡</button>
        ) : item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={`bottom-nav-item${item.active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.12em]">{item.label}</span>
          </Link>
        ) : (
          <button
            key={item.label}
            className={`bottom-nav-item${item.active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.12em]">{item.label}</span>
          </button>
        )
      )}
    </nav>
  )
}

function totalStock(product: ProductItem): number {
  return product.variants.reduce((sum, v) => sum + v.stock.totalQuantity, 0)
}

function primaryImage(product: ProductItem): string | null {
  return product.images.find((i) => i.primary)?.url ?? product.images[0]?.url ?? null
}

function formatPrice(price: number, currency: string): string {
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function ProductRow({ product }: { product: ProductItem }) {
  const stock    = totalStock(product)
  const isLow    = stock > 0 && stock <= 3
  const isEmpty  = stock === 0
  const imgUrl   = primaryImage(product)

  return (
    <Link
      href={`/store/stock/${product.id}`}
      className="stock-product-item group"
      style={{ textDecoration: 'none' }}
    >
      <div className="stock-product-thumb" style={{ background: 'var(--bg-2)' }}>
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[26px]">📦</span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-(--ink-0) leading-snug truncate">
          {product.name}
        </p>
        <p className="text-[13px] font-bold text-brand-400">
          {formatPrice(product.basePrice, product.currency)}
        </p>
        <div className={`flex items-center gap-1.5 mt-0.5 ${isLow ? 'stock-low-warning' : 'text-(--ink-3)'}`}>
          {isEmpty ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M6 4.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="text-[12px] font-medium">Sin stock</span>
            </>
          ) : isLow ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M6 4.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="text-[12px] font-medium">{stock} unidades (Stock bajo)</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 5h4M4 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] font-medium">{stock} unidades en stock</span>
            </>
          )}
        </div>
      </div>

      <span className="text-(--ink-3) group-hover:text-(--ink-1) transition-colors shrink-0 px-1 text-[16px] leading-none">
        ›
      </span>
    </Link>
  )
}

type Props = { store: StoreResponse; products: ProductItem[] }

export function SellerStoreDashboard({ store, products }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : products

  const hasProducts = products.length > 0

  const stockContent = (
    <>
      {/* Search */}
      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar productos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="stock-stats-card">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px]">📦</span>
          <span className="text-[14px] font-semibold text-(--ink-0)">{store.name}</span>
        </div>
        <span className="stock-count-badge">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Product list OR empty state */}
      {hasProducts ? (
        <div className="flex flex-col">
          {filtered.length > 0 ? (
            filtered.map((p) => <ProductRow key={p.id} product={p} />)
          ) : (
            <p className="text-[13px] text-(--ink-3) text-center py-6">
              Sin resultados para &quot;{search}&quot;
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-5 mt-6">
            <div className="stock-empty-icon">
              <span className="text-[52px]">📦</span>
            </div>
            <div className="text-center flex flex-col gap-2.5">
              <h1 className="font-display font-extrabold text-[24px] leading-tight tracking-[-0.03em] text-(--ink-0)">
                Bienvenido a tu<br />tienda digital
              </h1>
              <p className="text-[13px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
                Tus productos, tu control. Aquí se mostrarán los productos de tu tienda una vez
                que comiences a cargarlos.
              </p>
            </div>
            <Link
              href="/store/products/new"
              className="live-launch-btn w-full justify-center text-[14px]"
            >
              Cargar tu primer producto
            </Link>
          </div>

          {/* Live Sync — only in empty state */}
          <div className="stock-live-sync mt-4">
            <div className="stock-live-dot" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-(--ink-0)">
                Sincronización en vivo
              </span>
              <span className="text-[11px] text-(--ink-3)">
                Tus productos se sincronizan automáticamente
              </span>
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <span className="font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em]">
            MI STOCK
          </span>
          <Link href="/store/info" className="home-nav-icon" aria-label="Perfil de tienda">⚙️</Link>
        </div>

        <div className="px-5 pt-5 pb-2 flex flex-col gap-4 reveal d1">
          {stockContent}
        </div>

        <Link href="/store/products/new" className="stock-fab" aria-label="Agregar producto">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </Link>

        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="store-back-header px-12">
          <span className="font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em]">
            MI STOCK
          </span>
          <Link href="/store/info" className="home-nav-icon" aria-label="Perfil de tienda">⚙️</Link>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="flex flex-col gap-4 w-full max-w-md">
            {stockContent}
          </div>
        </div>
      </div>
    </>
  )
}
