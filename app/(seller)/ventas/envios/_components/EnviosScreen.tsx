'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { SHIPMENTS, SHIPMENT_STATUS_META, type Shipment, type ShipmentChannel, type ShipmentStatus } from './mockEnvios'
import { OrderDetailOverlay } from './OrderDetailOverlay'

type FilterTab = 'todos' | 'alertas' | 'pendientes' | 'en-camino' | 'entregados'

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'en-camino', label: 'En Camino' },
  { id: 'entregados', label: 'Entregados' },
]

function matchesFilter(status: ShipmentStatus, filter: FilterTab): boolean {
  if (filter === 'todos') return true
  if (filter === 'alertas') return status === 'alerta'
  if (filter === 'pendientes') return status === 'preparado'
  if (filter === 'en-camino') return status === 'en-camino'
  return status === 'entregado'
}

const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 5l6-3 6 3-6 3-6-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M2 5v6l6 3 6-3V5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M8 8v6" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

function AlertCard({ shipment, onOpen }: { shipment: Shipment; onOpen: () => void }) {
  const meta = SHIPMENT_STATUS_META[shipment.status]

  return (
    <div className="shipment-alert-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Comprador</span>
          <span className="text-[15px] font-bold text-(--ink-0)">{shipment.customer}</span>
        </div>
        <span className={`account-status-pill ${meta.pillClass} shrink-0`}>⚠ {meta.label}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-[12px] text-(--ink-2)">
          <BoxIcon />
          {shipment.product}
        </span>
        <span className="text-[11px] text-(--ink-3)">{shipment.orderCode}</span>
      </div>
      <button type="button" className="shipment-alert-resolve" onClick={onOpen}>
        Resolver →
      </button>
    </div>
  )
}

function ShipmentRow({ shipment, onOpen }: { shipment: Shipment; onOpen: () => void }) {
  const meta = SHIPMENT_STATUS_META[shipment.status]

  return (
    <button type="button" className={`live-order-row status-${shipment.status}`} onClick={onOpen}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-[13px] font-bold text-(--ink-0) truncate">
          {shipment.customer} <span className="font-normal text-(--ink-3)">· {shipment.product}</span>
        </span>
        <span className="text-[11px] text-(--ink-3)">{shipment.orderCode}</span>
      </div>
      <span className={`account-status-pill ${meta.pillClass} shrink-0`}>{meta.label}</span>
    </button>
  )
}

function EnviosContent() {
  const [channel, setChannel] = useState<ShipmentChannel>('lives')
  const [filter, setFilter] = useState<FilterTab>('todos')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  const channelShipments = useMemo(() => SHIPMENTS.filter((s) => s.channel === channel), [channel])

  const counts = useMemo(
    () => ({
      todos: channelShipments.length,
      alertas: channelShipments.filter((s) => s.status === 'alerta').length,
      pendientes: channelShipments.filter((s) => s.status === 'preparado').length,
      'en-camino': channelShipments.filter((s) => s.status === 'en-camino').length,
      entregados: channelShipments.filter((s) => s.status === 'entregado').length,
    }),
    [channelShipments]
  )

  const filtered = useMemo(
    () => channelShipments.filter((s) => matchesFilter(s.status, filter)),
    [channelShipments, filter]
  )

  const attention = filtered.filter((s) => s.status === 'alerta')
  const active = filtered.filter((s) => s.status !== 'alerta')
  const activeLabel = filter === 'entregados' ? 'Historial de Entregas' : 'Envíos Activos'

  return (
    <div className="flex flex-col gap-6">
      <div className="channel-toggle">
        <button
          type="button"
          className={`channel-toggle-btn${channel === 'lives' ? ' active' : ''}`}
          onClick={() => setChannel('lives')}
        >
          Lives
        </button>
        <button
          type="button"
          className={`channel-toggle-btn${channel === 'tienda' ? ' active' : ''}`}
          onClick={() => setChannel('tienda')}
        >
          Tienda
        </button>
      </div>

      <div className="stock-filter-chips">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`stock-filter-chip${filter === tab.id ? ' selected' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label} <span className="opacity-60">({counts[tab.id]})</span>
          </button>
        ))}
      </div>

      {attention.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[#fbbf24] uppercase px-0.5">
            Requieren Atención
          </span>
          <div className="flex flex-col gap-3">
            {attention.map((shipment) => (
              <AlertCard key={shipment.id} shipment={shipment} onOpen={() => setSelectedShipment(shipment)} />
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">
            {activeLabel}
          </span>
          <div className="flex flex-col gap-3">
            {active.map((shipment) => (
              <ShipmentRow key={shipment.id} shipment={shipment} onOpen={() => setSelectedShipment(shipment)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-[13px] text-(--ink-3) text-center py-8">Sin envíos en esta categoría</p>
      )}

      <button type="button" className="seller-ghost-sm w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed" disabled>
        Ver Historial Completo
      </button>

      {selectedShipment && (
        <OrderDetailOverlay shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
      )}
    </div>
  )
}

export function EnviosScreen() {
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
              Gestión de Envíos
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <EnviosContent />
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
              Gestión de Envíos
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <EnviosContent />
          </div>
        </div>
      </div>
    </>
  )
}
