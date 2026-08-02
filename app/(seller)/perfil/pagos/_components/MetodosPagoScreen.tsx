'use client'

import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { AccountStatusBanner } from '@/components/AccountStatusBanner'

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

const NfcIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 5.5a4 4 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M7 3.5a7 7 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M9.5 1.5a10 10 0 0 1 0 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M9.3 2.3l2.4 2.4L4.8 11.6 2 12l.4-2.8 6.9-6.9z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 3.8h10M5 3.8V2.5h4v1.3M12 3.8l-.7 8.2H2.7L2 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.7 6.3v3.2M8.3 6.3v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2.5l7.5 3v5.4c0 5-3.2 8.9-7.5 10.6-4.3-1.7-7.5-5.6-7.5-10.6V5.5l7.5-3z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function CardDots() {
  return (
    <div className="payment-card-dots">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  )
}

function PagosContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Mis Tarjetas</span>
        <h1 className="font-display font-extrabold text-[24px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          Gestionar Pagos
        </h1>
      </div>

      <AccountStatusBanner status="active" />

      <div className="flex flex-col gap-4">
        <Link href="/perfil/pagos/cuenta" className="payment-card featured">
          <div className="payment-card-top">
            <div className="flex flex-col">
              <span className="payment-card-titular-label">Titular</span>
              <span className="payment-card-titular-name">Alexandra Rivera</span>
            </div>
            <div className="payment-card-brand-chip">
              <div className="payment-card-brand-mark" />
            </div>
          </div>

          <div className="payment-card-number">
            <CardDots />
            <span className="payment-card-last4">8842</span>
          </div>

          <div className="payment-card-meta">
            <div className="payment-card-meta-group">
              <div>
                <span className="payment-card-meta-label">Expira</span>
                <span className="payment-card-meta-value">12/26</span>
              </div>
              <div>
                <span className="payment-card-meta-label">CVC</span>
                <span className="payment-card-meta-value">•••</span>
              </div>
            </div>
            <span className="payment-badge-principal">Principal</span>
          </div>
        </Link>

        <div className="payment-card">
          <div className="payment-card-top">
            <div className="flex flex-col">
              <span className="payment-card-titular-label">Titular</span>
              <span className="payment-card-titular-name">Alexandra Rivera</span>
            </div>
            <div className="payment-card-nfc">
              <NfcIcon />
            </div>
          </div>

          <div className="payment-card-number">
            <CardDots />
            <span className="payment-card-last4">1092</span>
          </div>

          <div className="payment-card-meta">
            <div>
              <span className="payment-card-meta-label">Expira</span>
              <span className="payment-card-meta-value">08/25</span>
            </div>
            <div className="payment-card-actions">
              <button type="button" className="payment-icon-btn" disabled aria-label="Editar tarjeta">
                <PencilIcon />
              </button>
              <button type="button" className="payment-icon-btn" disabled aria-label="Eliminar tarjeta">
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="payment-add-card-btn" disabled>
        <PlusIcon />
        Añadir Nueva Tarjeta
      </button>

      <div className="payment-info-card">
        <div className="payment-info-icon">
          <ShieldIcon />
        </div>
        <div className="flex flex-col">
          <span className="payment-info-title">Pago Seguro Encriptado</span>
          <span className="payment-info-desc">
            Tus datos de pago están protegidos con estándares de seguridad bancaria de nivel militar y encriptación de
            extremo a extremo.
          </span>
        </div>
      </div>
    </div>
  )
}

export function MetodosPagoScreen() {
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
              Métodos de Pago
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <PagosContent />
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
              Métodos de Pago
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <PagosContent />
          </div>
        </div>
      </div>
    </>
  )
}
