'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { LIVES, MONTH_STATS, ORDER_STATUS_META, SHIPPING_STATUS_META, formatMxn, type LiveSummary } from './mockLives'
import { LiveOrdersOverlay } from './LiveOrdersOverlay'

const PERIOD_LABEL = 'JUNIO 2026'

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="2.5" y="5.5" width="12" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14.5 9.2l5-2.9v9.4l-5-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

function LiveCard({
  live,
  expanded,
  onToggle,
  onViewAllOrders,
}: {
  live: LiveSummary
  expanded: boolean
  onToggle: () => void
  onViewAllOrders: () => void
}) {
  const shipping = SHIPPING_STATUS_META[live.shippingStatus]
  const recentOrders = live.allOrders.slice(0, 2)

  return (
    <div className={`live-summary-card${expanded ? ' expanded' : ''}`}>
      <button type="button" className="flex items-center gap-3 w-full text-left" onClick={onToggle}>
        <span className="w-11 h-11 rounded-full bg-(--bg-2) border border-(--line) flex items-center justify-center text-(--ink-1) shrink-0">
          <VideoIcon />
        </span>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[14px] font-bold text-(--ink-0) truncate">{live.title}</span>
          <span className="text-[11px] text-(--ink-3)">
            {live.duration} · {live.viewers} espect. · {live.orders} ped.
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-display font-bold text-[15px] text-(--ink-0)">{formatMxn(live.amount)}</span>
          <span className={`account-status-pill ${shipping.pillClass}`}>
            {shipping.icon} {shipping.label}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4">
          <div className="live-stat-grid">
            <div className="live-stat-cell">
              <span className="live-stat-value">{live.duration}</span>
              <span className="live-stat-label">Duración</span>
            </div>
            <div className="live-stat-cell">
              <span className="live-stat-value">{live.viewers}</span>
              <span className="live-stat-label">Espect.</span>
            </div>
            <div className="live-stat-cell">
              <span className="live-stat-value">{formatMxn(live.ticket)}</span>
              <span className="live-stat-label">Ticket</span>
            </div>
            <div className="live-stat-cell">
              <span className="live-stat-value">{live.conversion}%</span>
              <span className="live-stat-label">Conv.</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
              Pedidos Recientes
            </span>
            <div className="flex flex-col gap-2.5">
              {recentOrders.map((order) => {
                const meta = ORDER_STATUS_META[order.status]
                return (
                  <div key={order.id} className="account-payment-row">
                    <div className="flex flex-col">
                      <span className="account-payment-date">{order.customer}</span>
                      <span className="account-payment-method">{order.product}</span>
                    </div>
                    <div className="account-payment-right">
                      <span className={`account-status-pill ${meta.pillClass}`}>{meta.label}</span>
                      <span className="account-payment-amount">{formatMxn(order.amount)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onViewAllOrders}
            className="text-[12px] font-bold text-brand-400 hover:text-brand-300 transition-colors self-center"
          >
            Ver Todos los Pedidos →
          </button>
        </div>
      )}
    </div>
  )
}

function VentasContent() {
  const [expandedId, setExpandedId] = useState<string>(LIVES[0]!.id)
  const [overlayLive, setOverlayLive] = useState<LiveSummary | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
          Lo Que Va Del Mes
        </span>
        <span className="month-selector-pill">
          <button type="button" className="month-selector-arrow" disabled aria-label="Mes anterior">‹</button>
          {PERIOD_LABEL}
          <button type="button" className="month-selector-arrow" disabled aria-label="Mes siguiente">›</button>
        </span>
      </div>

      <div className="account-balance-grid">
        <div className="account-balance-card">
          <span className="account-balance-label">Por Lives</span>
          <span className="account-balance-value">{formatMxn(MONTH_STATS.porLives)}</span>
          <span className="text-[11px] text-(--ink-3)">{MONTH_STATS.porLivesPercent}% del total</span>
        </div>
        <div className="account-balance-card">
          <span className="account-balance-label">Pedidos Totales</span>
          <span className="account-balance-value">{MONTH_STATS.pedidosTotales}</span>
          <span className="text-[11px] text-brand-400 font-semibold">{MONTH_STATS.pedidosVsMesAnterior}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
          Historial de Lives
        </span>
        <div className="flex flex-col gap-3">
          {LIVES.map((live) => (
            <LiveCard
              key={live.id}
              live={live}
              expanded={expandedId === live.id}
              onToggle={() => setExpandedId((prev) => (prev === live.id ? prev : live.id))}
              onViewAllOrders={() => setOverlayLive(live)}
            />
          ))}
        </div>
      </div>

      {overlayLive && <LiveOrdersOverlay live={overlayLive} onClose={() => setOverlayLive(null)} />}
    </div>
  )
}

export function VentasLivesScreen() {
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
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Operación</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Mis Ventas
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
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Operación</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Mis Ventas
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
