'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import type { StoreResponse } from '@/lib/storeActions'

const BarChartIcon = () => (
  <svg width="56" height="48" viewBox="0 0 56 48" fill="none" aria-hidden="true" className="flex-shrink-0">
    <rect x="2"  y="30" width="12" height="16" rx="3" fill="#4ade80" opacity="0.5"/>
    <rect x="22" y="18" width="12" height="28" rx="3" fill="#4ade80" opacity="0.75"/>
    <rect x="42" y="4"  width="12" height="42" rx="3" fill="#4ade80"/>
  </svg>
)

type Props = { store: StoreResponse }

function InfoContent({ store }: Props) {
  const isActive = store.active && !store.suspended
  const isClosed = store.temporarilyClosed
  const storeId  = `#${store.slug.slice(0, 10).toUpperCase()}`

  const chipVariant = !isActive ? 'suspended' : isClosed ? 'closed' : 'active'
  const chipDot     = !isActive ? '#f87171'   : isClosed ? '#fbbf24' : '#4ade80'
  const chipLabel   = !isActive
    ? (store.suspended ? 'Suspendida' : 'Inactiva')
    : isClosed
      ? 'Cerrada temporalmente'
      : 'Tienda Activa'

  return (
    <div className="flex flex-col gap-5">

      {/* ── Profile ─────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="store-info-avatar">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[40px]">🛍</span>
          )}
        </div>

        <div className={`store-info-status-chip ${chipVariant}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: chipDot }} />
          {chipLabel}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-display font-extrabold text-[24px] leading-tight tracking-[-0.03em] text-(--ink-0)">
            {store.name}
          </h1>
          <p className="text-[11px] font-mono text-(--ink-3) tracking-[0.08em]">{storeId}</p>
          {store.description && (
            <p className="text-[13px] text-(--ink-2) leading-relaxed max-w-xs mt-1">
              {store.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Edit CTA ─────────────────────────────── */}
      <Link
        href="/store/info/edit"
        className="live-launch-btn w-full justify-center text-[13px] tracking-[0.06em] uppercase"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mr-1.5">
          <path d="M9.5 2.5L11.5 4.5M1.5 12.5l.9-3.6L10 1.4a1.41 1.41 0 0 1 2 2L4.1 11.6l-3.6.9z"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Editar Tienda
      </Link>

      {/* ── Stats row ────────────────────────────── */}
      <div className="flex gap-3">
        <div className="store-info-stat-card">
          <span className="store-info-stat-label">Calificación</span>
          <span className="store-info-stat-value text-amber-400">—</span>
        </div>
        <div className="store-info-stat-card">
          <span className="store-info-stat-label">Seguidores</span>
          <span className="store-info-stat-value text-blue-400">—</span>
        </div>
        <div className="store-info-stat-card">
          <span className="store-info-stat-label">Lives</span>
          <span className="store-info-stat-value text-(--brand-400)">—</span>
        </div>
      </div>

      {/* ── Rendimiento mensual ──────────────────── */}
      <div className="store-info-performance-card">
        <div className="flex flex-col min-w-0">
          <p className="store-info-perf-label">Rendimiento Mensual</p>
          <div className="store-info-perf-growth">—%</div>
          <p className="store-info-perf-sub">vs mes pasado</p>
        </div>
        <BarChartIcon />
      </div>

      {/* ── Quick access ─────────────────────────── */}
      <div className="flex gap-3">
        <div className="store-info-quick-card opacity-50 cursor-not-allowed">
          <div className="store-info-quick-icon" style={{ background: 'rgba(255,31,135,0.12)', border: '1px solid rgba(255,31,135,0.20)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 13h14M2 9h9M2 5h6" stroke="var(--brand-400)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="14" cy="5" r="2.5" stroke="var(--brand-400)" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-bold text-(--ink-0)">Analíticas</p>
            <p className="text-[11px] text-(--ink-3) leading-snug">Revisa tus ingresos y alcance.</p>
          </div>
        </div>

        <Link href="/store/stock" className="store-info-quick-card">
          <div className="store-info-quick-icon" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.24)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-bold text-(--ink-0)">Catálogo</p>
            <p className="text-[11px] text-(--ink-3) leading-snug">Gestiona tus productos y stock.</p>
          </div>
        </Link>
      </div>

    </div>
  )
}

export function StoreInfoScreen({ store }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store" className="store-back-btn" aria-label="Volver" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Mi Tienda
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Shop Profile
            </span>
          </div>
          <Link href="/store/manage" className="home-nav-icon" aria-label="Opciones">⋮</Link>
        </div>

        <div className="px-5 pt-3 pb-2 flex flex-col gap-4 reveal d1">
          <InfoContent store={store} />
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
            Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Tienda</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">Shop Profile</span>
          </div>
          <Link href="/store/manage" className="home-nav-icon" aria-label="Opciones">⋮</Link>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            <InfoContent store={store} />
          </div>
        </div>
      </div>
    </>
  )
}
