'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { STORE_SALES, STORE_STATS, STORE_STATUS_META, formatMxn, type StoreSale, type StoreSalePeriod } from './mockTienda'
import { OrderDetailOverlay } from './OrderDetailOverlay'

type FilterTab = 'recientes' | StoreSalePeriod

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'recientes', label: 'Recientes' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
]

const PERIOD_RANK: Record<StoreSalePeriod, number> = { hoy: 0, semana: 1, mes: 2 }

const CoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="6" width="15" height="10.5" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="11.2" r="2.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M6 7V5.5a5 5 0 0 1 10 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="3" y="7" width="16" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const TicketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M2.5 7.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1a1.6 1.6 0 0 0 0 3.2v1a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-1a1.6 1.6 0 0 0 0-3.2z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M8 6v8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.6 1.8" strokeLinecap="round" />
  </svg>
)

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="account-balance-card items-center text-center">
      <span className="text-brand-400">{icon}</span>
      <span className="account-balance-value">{value}</span>
      <span className="account-balance-label">{label}</span>
    </div>
  )
}

function SaleRow({ sale, onOpen }: { sale: StoreSale; onOpen: () => void }) {
  const meta = STORE_STATUS_META[sale.status]

  return (
    <button type="button" className={`live-order-row status-${sale.status}`} onClick={onOpen}>
      <div className="stock-product-thumb" style={{ background: 'var(--bg-2)' }}>
        <span className="text-[22px]">{sale.productEmoji}</span>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-bold text-(--ink-0) truncate">{sale.product}</span>
          <span className="text-[13px] font-bold text-(--ink-0) shrink-0">
            {formatMxn(sale.amount)} <span className="text-[10px] font-semibold text-(--ink-3)">MXN</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-(--ink-3) truncate">{sale.customer}</span>
          <span className="text-[10px] text-(--ink-3) shrink-0">
            {sale.dateLabel} · {sale.timeLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={`account-status-pill ${meta.pillClass}`}>{meta.label}</span>
          <span className="text-(--ink-3) text-[13px]">→</span>
        </div>
      </div>
    </button>
  )
}

function VentasContent() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('recientes')
  const [selectedSale, setSelectedSale] = useState<StoreSale | null>(null)

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase()
    return STORE_SALES.filter((sale) => {
      const matchesSearch =
        !q || sale.product.toLowerCase().includes(q) || sale.customer.toLowerCase().includes(q)
      const matchesFilter = filter === 'recientes' || PERIOD_RANK[sale.period] <= PERIOD_RANK[filter]
      return matchesSearch && matchesFilter
    })
  }, [search, filter])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard icon={<CoinIcon />} value={formatMxn(STORE_STATS.ventasTotales)} label="Ventas Totales" />
        <StatCard icon={<BagIcon />} value={String(STORE_STATS.vendidos)} label="Vendidos" />
        <StatCard icon={<TicketIcon />} value={formatMxn(STORE_STATS.ticketProm)} label="Ticket Prom." />
      </div>

      <div className="stock-search-wrap">
        <span className="stock-search-icon">🔍</span>
        <input
          type="search"
          className="stock-search"
          placeholder="Buscar producto o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="stock-filter-chips">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`stock-filter-chip${filter === tab.id ? ' selected' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
          Últimos Productos Vendidos
        </span>
        <div className="flex flex-col gap-3">
          {filteredSales.length === 0 ? (
            <p className="text-[13px] text-(--ink-3) text-center py-8">
              Sin resultados para &quot;{search}&quot;
            </p>
          ) : (
            filteredSales.map((sale) => (
              <SaleRow key={sale.id} sale={sale} onOpen={() => setSelectedSale(sale)} />
            ))
          )}
        </div>
      </div>

      {selectedSale && <OrderDetailOverlay sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  )
}

export function VentasTiendaScreen() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/ventas" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Tienda</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Historial de Ventas
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <VentasContent />
        </div>

        <SellerBottomNav active="ventas" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/ventas"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Tienda</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Historial de Ventas
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <VentasContent />
          </div>
        </div>
      </div>
    </>
  )
}
