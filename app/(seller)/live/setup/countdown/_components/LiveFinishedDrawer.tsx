'use client'

import { useState, useEffect } from 'react'
import type { LiveResponse } from '@/lib/liveActions'

type LiveFinishedOrder = {
  id: string
  customerName: string
  amount: number
  currency: string
  imageUrl: string | null
}

type LiveFinishedSummary = {
  ordersCount: number
  salesTotal: number
  currency: string
  conversionRate: number
  orders: LiveFinishedOrder[]
}

const MOCK_CUSTOMER_NAMES = [
  'Camila Rodríguez',
  'Martín Álvarez',
  'Sofía Gómez',
  'Lucas Fernández',
  'Valentina Torres',
]

/**
 * No hay módulo de orders/tracking conectado todavía — el resto del flujo
 * post-live sigue siendo mock hasta la validación del usuario final.
 */
function buildMockSummary(): LiveFinishedSummary {
  const orders: LiveFinishedOrder[] = MOCK_CUSTOMER_NAMES.map((customerName, index) => ({
    id: `mock-order-${index}`,
    customerName,
    amount: 1200 + index * 350,
    currency: 'MXN',
    imageUrl: null,
  }))

  return {
    ordersCount: orders.length,
    salesTotal: orders.reduce((sum, order) => sum + order.amount, 0),
    currency: 'MXN',
    conversionRate: 18,
    orders,
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

type Props = {
  live: LiveResponse
  onGenerateLabels: (selectedOrderIds: string[]) => void
  onReviewOrders: () => void
}

export function LiveFinishedDrawer({ live, onGenerateLabels, onReviewOrders }: Props) {
  const [summary, setSummary] = useState<LiveFinishedSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const result = buildMockSummary()
    setSummary(result)
    setSelected(new Set(result.orders.map((order) => order.id)))
    setLoading(false)
  }, [])

  const allSelected = summary !== null && selected.size === summary.orders.length

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (!summary) return
    setSelected(allSelected ? new Set() : new Set(summary.orders.map((order) => order.id)))
  }

  return (
    <>
      <div className="live-stock-overlay" aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Live finalizado"
      >
        <div className="live-stock-handle" />

        <div className="live-finished-header">
          <h2 className="live-finished-title">Live finalizado</h2>
          <p className="live-finished-subtitle">
            <span aria-hidden="true">🕐</span>
            {formatDuration(live.displayDurationSeconds)} · {live.peakViewers} espectadores
          </p>
        </div>

        {loading && (
          <div className="live-stock-body flex flex-col items-center justify-center py-10">
            <div className="live-camera-dots">
              <span className="live-camera-dot" style={{ animationDelay: '0s' }} />
              <span className="live-camera-dot" style={{ animationDelay: '0.2s' }} />
              <span className="live-camera-dot" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="live-camera-label mt-2">Calculando resumen...</span>
          </div>
        )}

        {!loading && !summary && (
          <div className="live-stock-body flex flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="live-camera-label">No pudimos cargar el resumen del live todavía.</span>
            <button type="button" className="live-finished-secondary-btn" onClick={onReviewOrders}>
              Revisar pedidos
            </button>
          </div>
        )}

        {!loading && summary && (
        <div className="live-stock-body">
          <div className="flex gap-2.5">
            <div className="store-info-stat-card">
              <span className="store-info-stat-value">{summary.ordersCount}</span>
              <span className="store-info-stat-label">Pedidos</span>
            </div>
            <div className="store-info-stat-card">
              <span className="store-info-stat-value">
                ${summary.salesTotal.toLocaleString('es-MX')}
              </span>
              <span className="store-info-stat-label">Ventas {summary.currency}</span>
            </div>
            <div className="store-info-stat-card">
              <span className="store-info-stat-value">{summary.conversionRate}%</span>
              <span className="store-info-stat-label">Conversión</span>
            </div>
          </div>

          <div className="live-stock-section-header">
            <span className="live-stock-section-label">Órdenes listas para envío</span>
            <button type="button" className="live-finished-select-all" onClick={toggleAll}>
              {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
          </div>

          <div className="live-stock-list">
            {summary.orders.map((order) => {
              const isChecked = selected.has(order.id)
              return (
                <button
                  key={order.id}
                  type="button"
                  className="live-stock-item w-full border-0 bg-transparent text-left text-inherit cursor-pointer"
                  onClick={() => toggle(order.id)}
                  aria-pressed={isChecked}
                >
                  <div className="live-stock-thumb" aria-hidden="true">
                    {order.imageUrl ? (
                      <img
                        src={order.imageUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '📦'
                    )}
                  </div>

                  <div className="live-stock-info">
                    <div className="live-stock-item-name">{order.customerName}</div>
                    <div className="live-stock-item-price">
                      ${order.amount.toLocaleString('es-MX')} <span>{order.currency}</span>
                    </div>
                  </div>

                  <div className={`live-finished-order-check${isChecked ? ' checked' : ''}`} aria-hidden="true">
                    {isChecked && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="#1a0612" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        )}

        {!loading && summary && (
        <div className="live-finished-footer">
          <button
            type="button"
            className="live-picker-cta"
            disabled={selected.size === 0}
            onClick={() => onGenerateLabels(Array.from(selected))}
          >
            Generar guías de envío
          </button>
          <button type="button" className="live-finished-secondary-btn" onClick={onReviewOrders}>
            Revisar pedidos primero
          </button>
          <p className="live-finished-info">
            <span aria-hidden="true">ℹ️</span>
            Las guías se generarán automáticamente con 99minutos. Solo necesitás imprimir y acomodar los paquetes.
          </p>
        </div>
        )}
      </div>
    </>
  )
}
