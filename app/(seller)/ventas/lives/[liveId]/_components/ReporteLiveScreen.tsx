'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import {
  ORDER_STATUS_META,
  buildConversionFunnel,
  formatMxn,
  type LiveSummary,
} from '../../_components/mockLives'
import { LiveOrdersOverlay } from '../../_components/LiveOrdersOverlay'
import { TopProductsOverlay } from './TopProductsOverlay'

type Props = { live: LiveSummary }

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
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
  </svg>
)

const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 14.5l5-5.5 3.5 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 4.5h3.5v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8M4.5 7L8 10.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

function rankClass(rank: number): string {
  return rank <= 3 ? `rank-${rank}` : 'rank-default'
}

function ReporteContent({ live }: { live: LiveSummary }) {
  const [productsOpen, setProductsOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)

  const { report } = live
  const trendUp = report.trendPercent >= 0
  const peakIndex = report.viewerTimeline.indexOf(Math.max(...report.viewerTimeline))
  const maxViewer = report.viewerTimeline[peakIndex] ?? 1
  const topThreeProducts = report.topProducts.slice(0, 3)
  const previewOrders = live.allOrders.slice(0, 3)
  const funnel = buildConversionFunnel(live)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="seller-location-badge w-fit">● {report.statusLabel}</span>
        <h1 className="font-display font-extrabold text-[22px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          {live.title}
        </h1>
        <span className="text-[12px] text-(--ink-3)">
          {live.dateLabel} · {report.timeRangeLabel} · {live.duration}
        </span>
      </div>

      <div className="income-card">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase">Ventas Totales</span>
          <span
            className="income-trend-pill"
            style={
              trendUp
                ? undefined
                : { background: 'rgba(239,68,68,0.14)', borderColor: 'rgba(239,68,68,0.30)', color: '#f87171' }
            }
          >
            {trendUp ? '↗' : '↘'} {trendUp ? '+' : ''}
            {report.trendPercent}% vs. live anterior
          </span>
        </div>
        <span className="income-amount">
          {formatMxn(live.amount)} <span className="text-[15px] font-bold text-(--ink-3)">MXN</span>
        </span>
        <span className="text-[12px] text-(--ink-2)">
          {live.orders} pedidos pagados de {report.uniqueViewers} espectadores únicos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="ops-stat-card">
          <span className="ops-stat-icon" style={{ background: 'rgba(255,31,135,0.14)', color: 'var(--brand-400)' }}>
            <TicketIcon />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Pedidos</span>
            <span className="ops-stat-value">{live.orders}</span>
          </div>
        </div>
        <div className="ops-stat-card">
          <span className="ops-stat-icon" style={{ background: 'rgba(74,222,128,0.14)', color: '#4ade80' }}>
            <BagIcon />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Productos Vendidos</span>
            <span className="ops-stat-value">{report.topProducts.reduce((sum, p) => sum + p.unitsSold, 0)}</span>
          </div>
        </div>
        <div className="ops-stat-card">
          <span className="ops-stat-icon" style={{ background: 'rgba(56,189,248,0.14)', color: 'var(--cyan-400)' }}>
            <EyeIcon />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Espectadores</span>
            <span className="ops-stat-value">{report.uniqueViewers}</span>
          </div>
        </div>
        <div className="ops-stat-card">
          <span className="ops-stat-icon" style={{ background: 'rgba(251,191,36,0.14)', color: '#fbbf24' }}>
            <TrendIcon />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Conversión</span>
            <span className="ops-stat-value">{live.conversion}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase">Espectadores en Vivo</span>
          <span className="stock-count-badge">Pico {report.peakViewers}</span>
        </div>
        <div className="viewer-chart">
          {report.viewerTimeline.map((value, i) => (
            <div
              key={i}
              className={`viewer-chart-bar${i === peakIndex ? ' peak' : ''}`}
              style={{ height: `${(value / maxViewer) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-(--ink-3) px-0.5">
          <span>{report.viewerGrowthLabel}</span>
          <span>Pico de {report.peakViewers} viewers</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase">Productos Más Vendidos</span>
          <button type="button" className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors" onClick={() => setProductsOpen(true)}>
            Ver todo
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {topThreeProducts.map((product) => (
            <div key={product.rank} className="account-payment-row items-center gap-3">
              <span className={`rank-badge ${rankClass(product.rank)}`}>{product.rank}</span>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-(--ink-0) truncate">{product.name}</span>
                  <span className="account-payment-amount shrink-0">{formatMxn(product.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rank-progress-track">
                    <div
                      className={`rank-progress-fill ${rankClass(product.rank)}`}
                      style={{ width: `${(product.amount / topThreeProducts[0]!.amount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-(--ink-3) shrink-0">{product.unitsSold} und.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase">Pedidos</span>
          <button type="button" className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors" onClick={() => setOrdersOpen(true)}>
            Ver todo
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {previewOrders.map((order) => {
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
        <span className="text-[11px] text-(--ink-3) text-center">
          {live.orders} pedidos en total · {formatMxn(live.amount)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">Embudo de Conversión</span>
        <div className="flex flex-col gap-3.5">
          {funnel.map((step) => (
            <div key={step.label} className="funnel-row">
              <div className="funnel-row-header">
                <span className="text-(--ink-2)">{step.label}</span>
                <span className="font-bold text-(--ink-0)">
                  {step.value} <span className="text-(--ink-3) font-normal">· {step.percent}%</span>
                </span>
              </div>
              <div className="funnel-bar-track">
                <div className="funnel-bar-fill" style={{ width: `${step.percent}%`, background: step.colorVar }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="live-orders-download-btn" disabled>
        <DownloadIcon />
        Descargar Reporte
      </button>

      {productsOpen && <TopProductsOverlay live={live} onClose={() => setProductsOpen(false)} />}
      {ordersOpen && <LiveOrdersOverlay live={live} onClose={() => setOrdersOpen(false)} />}
    </div>
  )
}

export function ReporteLiveScreen({ live }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/ventas/lives" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Live</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Reporte de Ventas
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <ReporteContent live={live} />
        </div>

        <SellerBottomNav active="ventas" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/ventas/lives"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Live</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Reporte de Ventas
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <ReporteContent live={live} />
          </div>
        </div>
      </div>
    </>
  )
}
