'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { STORE_STATUS_META, buildSaleTimeline, formatMxn, type StoreSale } from './mockTienda'

type Props = {
  sale: StoreSale
  onClose: () => void
}

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="6.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 18s6-5.5 6-10.5A6 6 0 0 0 4 7.5C4 12.5 10 18 10 18z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 8a6 6 0 1 1 3.2 5.3L2 14l0.9-3A6 6 0 0 1 2 8z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8M4.5 7L8 10.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export function OrderDetailOverlay({ sale, onClose }: Props) {
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

  const timeline = buildSaleTimeline(sale)
  const statusMeta = STORE_STATUS_META[sale.status]

  return createPortal(
    <div className="order-detail-overlay" role="dialog" aria-modal="true" aria-label="Detalle del Pedido">
      <div className="live-orders-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="live-orders-close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display font-bold text-[15px] text-(--ink-0) truncate">Detalle del Pedido</span>
        </div>
        <span className={`account-status-pill ${statusMeta.pillClass} shrink-0`}>{statusMeta.label}</span>
      </div>

      <div className="live-orders-body">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
            Estado del Pedido
          </span>
          <div className="order-timeline">
            {timeline.map((step) => (
              <div key={step.label} className="order-timeline-step">
                <div className="order-timeline-marker">
                  <span className={`order-timeline-dot ${step.state}`} />
                </div>
                <div className="order-timeline-content">
                  <span className={`order-timeline-label ${step.state}`}>{step.label}</span>
                  <span className="order-timeline-detail">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="account-bank-card">
          <div className="stock-product-thumb" style={{ background: 'var(--bg-2)' }}>
            <span className="text-[24px]">{sale.productEmoji}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="account-bank-name truncate">{sale.product}</span>
            <span className="account-bank-mask">{sale.sku}</span>
          </div>
          <span className="account-payment-amount ml-auto shrink-0">{formatMxn(sale.amount)}</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
            Información del Comprador
          </span>
          <div className="account-bank-card">
            <div className="account-bank-icon">
              <PersonIcon />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="account-bank-name truncate">{sale.customer}</span>
              <span className="account-bank-mask">{sale.customerPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
            Dirección de Envío
          </span>
          <div className="account-bank-card">
            <div className="account-bank-icon">
              <PinIcon />
            </div>
            <span className="text-[12px] text-(--ink-1) leading-relaxed">{sale.shippingAddress}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Paquetería</span>
            <span className="text-[13px] font-bold text-(--ink-0)">{sale.carrier}</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[9px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Entrega Estimada</span>
            <span className="text-[13px] font-bold text-(--ink-0)">{sale.deliveryEstimateLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            className="live-launch-btn w-full justify-center text-[13px] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled
          >
            <ChatIcon />
            Contactar Comprador
          </button>
          <button
            type="button"
            className="seller-ghost-sm w-full justify-center text-[13px] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled
          >
            <DownloadIcon />
            <span className="ml-1.5">Descargar Guía PDF</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
