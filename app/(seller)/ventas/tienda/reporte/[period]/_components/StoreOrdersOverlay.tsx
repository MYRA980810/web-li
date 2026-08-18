'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { STORE_STATUS_META, formatMxn, type StoreSale } from '../../../_components/mockTienda'
import { OrderDetailOverlay } from '../../../_components/OrderDetailOverlay'

type Props = {
  sales: StoreSale[]
  totalAmount: number
  periodLabel: string
  onClose: () => void
}

export function StoreOrdersOverlay({ sales, totalAmount, periodLabel, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [selectedSale, setSelectedSale] = useState<StoreSale | null>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe portal mount guard, no non-effect equivalent (mandated pattern, see AGENTS.md Bottom Nav Pattern)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div className="live-orders-overlay" role="dialog" aria-modal="true" aria-label="Pedidos">
      <div className="live-orders-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="live-orders-close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display font-bold text-[15px] text-brand-400 truncate">Pedidos</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-display font-bold text-[16px] text-(--ink-0)">{formatMxn(totalAmount)}</span>
          <span className="text-[10px] text-(--ink-3)">{periodLabel}</span>
        </div>
      </div>

      <div className="live-orders-body">
        {sales.map((sale) => {
          const meta = STORE_STATUS_META[sale.status]
          return (
            <button
              key={sale.id}
              type="button"
              className={`live-order-row status-${sale.status}`}
              onClick={() => setSelectedSale(sale)}
            >
              <div className="stock-product-thumb" style={{ background: 'var(--bg-2)' }}>
                <span className="text-[22px]">{sale.productEmoji}</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-(--ink-0) truncate">{sale.product}</span>
                  <span className="text-[13px] font-bold text-(--ink-0) shrink-0">{formatMxn(sale.amount)}</span>
                </div>
                <span className="text-[11px] text-(--ink-3)">
                  {sale.customer} · {sale.dateLabel} {sale.timeLabel}
                </span>
                <span className={`account-status-pill ${meta.pillClass} shrink-0 self-start mt-1`}>{meta.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedSale && <OrderDetailOverlay sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>,
    document.body
  )
}
