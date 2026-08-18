'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatMxn, type LiveSummary } from '../../_components/mockLives'

type Props = {
  live: LiveSummary
  onClose: () => void
}

function rankClass(rank: number): string {
  return rank <= 3 ? `rank-${rank}` : 'rank-default'
}

export function TopProductsOverlay({ live, onClose }: Props) {
  const [mounted, setMounted] = useState(false)

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

  const products = live.report.topProducts
  const maxAmount = products[0]?.amount ?? 1

  return createPortal(
    <div className="live-orders-overlay" role="dialog" aria-modal="true" aria-label="Productos Más Vendidos">
      <div className="live-orders-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="live-orders-close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display font-bold text-[15px] text-brand-400 truncate">Productos Más Vendidos</span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-display font-bold text-[16px] text-(--ink-0)">{formatMxn(live.amount)}</span>
          <span className="text-[10px] text-(--ink-3)">{live.dateLabel}</span>
        </div>
      </div>

      <div className="live-orders-body">
        {products.map((product) => (
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
                    style={{ width: `${(product.amount / maxAmount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-(--ink-3) shrink-0">{product.unitsSold} und.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}
