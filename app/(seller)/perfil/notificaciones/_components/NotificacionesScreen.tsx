'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M8 2v1.4M8 12.6V14M14 8h-1.4M3.4 8H2M12.1 3.9l-1 1M4.9 11.1l-1 1M12.1 12.1l-1-1M4.9 4.9l-1-1"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="notif-row">
      <span className="notif-row-label">{label}</span>
      <button
        type="button"
        className={`live-toggle${checked ? ' on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      />
    </div>
  )
}

function NotificacionesContent() {
  const [newLives, setNewLives] = useState(true)
  const [messages, setMessages] = useState(true)
  const [exclusiveOffers, setExclusiveOffers] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)

  return (
    <div className="flex flex-col gap-6">
      <div className="seller-hero-card">
        <div className="seller-hero-bg" />
        <div className="seller-hero-overlay" />
        <div className="seller-hero-body">
          <span className="eyebrow mb-2.5">Centro de Control</span>
          <h2 className="seller-hero-title">
            Gestioná tu <em className="grad-text not-italic">Pulso</em>
          </h2>
        </div>
      </div>

      <div className="notif-group-card">
        <div className="notif-group-header">
          <div className="notif-group-icon">🔴</div>
          <div className="flex flex-col">
            <span className="notif-group-title">Actividad en Vivo</span>
            <span className="notif-group-desc">Mantente al día con tus creadores</span>
          </div>
        </div>
        <ToggleRow label="Nuevos Lives" checked={newLives} onToggle={() => setNewLives((v) => !v)} />
        <ToggleRow label="Mensajes" checked={messages} onToggle={() => setMessages((v) => !v)} />
      </div>

      <div className="notif-group-card">
        <div className="notif-group-header">
          <div className="notif-group-icon">🛍</div>
          <div className="flex flex-col">
            <span className="notif-group-title">Compras y Pedidos</span>
            <span className="notif-group-desc">Seguimiento de tus adquisiciones</span>
          </div>
        </div>
        <ToggleRow
          label="Ofertas Exclusivas"
          checked={exclusiveOffers}
          onToggle={() => setExclusiveOffers((v) => !v)}
        />
        <ToggleRow
          label="Actualizaciones de Pedido"
          checked={orderUpdates}
          onToggle={() => setOrderUpdates((v) => !v)}
        />
      </div>

      <div className="flex gap-3">
        <div className="notif-quick-card">
          <span className="notif-quick-icon">🌙</span>
          <span className="notif-quick-title">Modo Relax</span>
          <span className="notif-quick-desc">Pausa todas las notificaciones por la noche.</span>
        </div>
        <div className="notif-quick-card critical">
          <span className="notif-quick-icon">⚡</span>
          <span className="notif-quick-title">Alertas Críticas</span>
          <span className="notif-quick-desc">Recibí avisos urgentes sobre tu cuenta siempre.</span>
        </div>
      </div>
    </div>
  )
}

export function NotificacionesScreen() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/perfil" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Notificaciones
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <NotificacionesContent />
        </div>

        <SellerBottomNav active="perfil" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/perfil"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Notificaciones
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <NotificacionesContent />
          </div>
        </div>
      </div>
    </>
  )
}
