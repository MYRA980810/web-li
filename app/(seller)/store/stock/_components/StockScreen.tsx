'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'

type StockProduct = {
  id: string
  name: string
  price: number
  currency: string
  stock: number
  isLow: boolean
  emoji: string
  bg: string
}

const MOCK_PRODUCTS: StockProduct[] = [
  {
    id: 'p1',
    name: 'Reloj Inteligente Pro',
    price: 1299.00,
    currency: 'MXN',
    stock: 15,
    isLow: false,
    emoji: '⌚',
    bg: 'radial-gradient(ellipse at 50% 40%, #0e1e2e, #06090f)',
  },
  {
    id: 'p2',
    name: 'Audífonos Wireless Noise Cancelling',
    price: 850.00,
    currency: 'MXN',
    stock: 8,
    isLow: false,
    emoji: '🎧',
    bg: 'radial-gradient(ellipse at 50% 40%, #10102a, #060610)',
  },
  {
    id: 'p3',
    name: 'Tenis Deportivos Speed',
    price: 2100.00,
    currency: 'MXN',
    stock: 2,
    isLow: true,
    emoji: '👟',
    bg: 'radial-gradient(ellipse at 50% 40%, #1e1008, #0a0604)',
  },
]

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',    active: false, href: '/home' },
  { icon: '📦', label: 'Stock',   active: true,  href: '/store/stock' },
  { icon: '📊', label: 'Ventas',  active: false, href: null },
  { icon: '👤', label: 'Profile', active: false, href: null },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.href ? (
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

function ProductRow({ product }: { product: StockProduct }) {
  return (
    <div className="stock-product-item">
      <div className="stock-product-thumb" style={{ background: product.bg }}>
        <span className="text-[28px]">{product.emoji}</span>
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-(--ink-0) leading-snug">{product.name}</p>
        <p className="text-[13px] font-bold text-brand-400">
          {formatPrice(product.price, product.currency)}
        </p>
        <div className={`flex items-center gap-1.5 mt-0.5 ${product.isLow ? 'stock-low-warning' : 'text-(--ink-3)'}`}>
          {product.isLow ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M6 4.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="text-[12px] font-medium">{product.stock} unidades (Stock bajo)</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 5h4M4 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] font-medium">{product.stock} unidades en stock</span>
            </>
          )}
        </div>
      </div>
      <button
        className="text-(--ink-3) hover:text-(--ink-1) transition-colors flex-shrink-0 px-1 text-[20px] leading-none"
        aria-label="Opciones"
      >
        ⋮
      </button>
    </div>
  )
}

function StockContent() {
  const totalUnits = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar productos..."
        />
      </div>

      <div className="stock-stats-card">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px]">📦</span>
          <span className="text-[14px] font-semibold text-(--ink-0)">Inventario Total</span>
        </div>
        <span className="stock-count-badge">{totalUnits} UNIDADES</span>
      </div>

      <div className="flex flex-col">
        {MOCK_PRODUCTS.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

export function StockScreen() {
  const router = useRouter()

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <button
            className="store-back-btn text-brand-400"
            onClick={() => router.back()}
            aria-label="Volver"
          >
            ←
          </button>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            Mi Stock
          </span>
          <button className="home-nav-icon" aria-label="Filtros">
            <FilterIcon />
          </button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          <StockContent />
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

        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <button
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            onClick={() => router.back()}
          >
            ← Volver
          </button>
          <span className="font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase">
            Mi Stock
          </span>
          <button className="home-nav-icon" aria-label="Filtros">
            <FilterIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            <StockContent />
          </div>
        </div>
      </div>
    </>
  )
}
