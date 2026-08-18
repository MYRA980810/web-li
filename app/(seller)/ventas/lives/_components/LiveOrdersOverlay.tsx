'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ORDER_STATUS_META, formatMxn, type LiveOrder, type LiveSummary } from './mockLives'
import { OrderDetailOverlay } from './OrderDetailOverlay'

type Props = {
  live: LiveSummary
  onClose: () => void
}

const SlidersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="6" cy="4" r="1.6" fill="var(--bg-0)" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="8" r="1.6" fill="var(--bg-0)" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="5" cy="12" r="1.6" fill="var(--bg-0)" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8M4.5 7L8 10.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export function LiveOrdersOverlay({ live, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe portal mount guard, no non-effect equivalent (mandated pattern, see AGENTS.md Bottom Nav Pattern)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return live.allOrders
    return live.allOrders.filter(
      (order) => order.customer.toLowerCase().includes(q) || order.orderCode.toLowerCase().includes(q)
    )
  }, [live.allOrders, search])

  if (!mounted) return null

  return createPortal(
    <div className="live-orders-overlay" role="dialog" aria-modal="true" aria-label="Pedidos del Live">
      <div className="live-orders-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="live-orders-close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display font-bold text-[15px] text-brand-400 truncate">Pedidos del Live</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-display font-bold text-[16px] text-(--ink-0)">{formatMxn(live.amount)}</span>
          <span className="text-[10px] text-(--ink-3)">{live.dateLabel}</span>
        </div>
      </div>

      <div className="live-orders-toolbar">
        <div className="stock-search-wrap">
          <span className="stock-search-icon">🔍</span>
          <input
            type="search"
            className="stock-search"
            placeholder="Buscar por cliente o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="live-orders-filter-btn" disabled aria-label="Filtros (próximamente)">
          <SlidersIcon />
        </button>
      </div>

      <div className="live-orders-body">
        {filteredOrders.length === 0 ? (
          <p className="text-[13px] text-(--ink-3) text-center py-8">
            Sin resultados para &quot;{search}&quot;
          </p>
        ) : (
          filteredOrders.map((order) => {
            const meta = ORDER_STATUS_META[order.status]
            return (
              <button
                key={order.id}
                type="button"
                className={`live-order-row status-${order.status}`}
                onClick={() => setSelectedOrder(order)}
              >
                <span className="live-order-avatar">{order.avatarInitial}</span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-(--ink-0) truncate">{order.customer}</span>
                    <span className="text-[13px] font-bold text-(--ink-0) shrink-0">{formatMxn(order.amount)}</span>
                  </div>
                  <span className="text-[11px] text-(--ink-3)">
                    {order.orderCode} · {order.time}
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[11px] text-(--ink-2) truncate">{order.product}</span>
                    <span className={`account-status-pill ${meta.pillClass} shrink-0`}>{meta.label}</span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="live-orders-footer">
        <button type="button" className="live-orders-download-btn" disabled>
          <DownloadIcon />
          Descargar Reporte
        </button>
      </div>

      {selectedOrder && (
        <OrderDetailOverlay order={selectedOrder} live={live} onClose={() => setSelectedOrder(null)} />
      )}
    </div>,
    document.body
  )
}
