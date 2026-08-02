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

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3.4h-3.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7.2l2.6 2.6L11 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 8L10 3.5 17.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 8v7.5M7 8v7.5M13 8v7.5M16.5 8v7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 15.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

const CHECKS = ['Conectado', 'Cobros habilitados', 'Pagos habilitados', 'Datos enviados']

const SCHEDULED_PAYMENTS = [
  { date: '5 ago 2026', method: 'Transferencia · BBVA México', status: 'scheduled' as const, amount: 21840 },
  { date: '12 ago 2026', method: 'Transferencia · BBVA México', status: 'scheduled' as const, amount: 18920 },
  { date: '29 jul 2026', method: 'Transferencia · BBVA México', status: 'paid' as const, amount: 15340 },
]

const STATUS_PILL_LABEL = { scheduled: 'Programado', paid: 'Pagado' }

function CuentaContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Cuenta de Pagos</span>
        <button type="button" className="account-refresh-btn" disabled>
          <RefreshIcon />
          Actualizar
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display font-extrabold text-[24px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          Bloom &amp; Co. Boutique
        </h1>
        <p className="text-[12px] text-(--ink-3)">bloomboutique.com.mx · pagos@bloomboutique.com.mx</p>
      </div>

      <AccountStatusBanner status="active" />

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Estado de la Cuenta</p>
        <div className="account-check-grid">
          {CHECKS.map((label) => (
            <div key={label} className="account-check-chip">
              <div className="account-check-dot ok">
                <CheckIcon />
              </div>
              <span className="account-check-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Balance</p>
        <div className="account-balance-grid">
          <div className="account-balance-card">
            <span className="account-balance-label">Disponible</span>
            <span className="account-balance-value">{formatPrice(184230)}</span>
          </div>
          <div className="account-balance-card">
            <span className="account-balance-label">En camino</span>
            <span className="account-balance-value">{formatPrice(42610)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">
          Próximos Pagos Programados
        </p>
        <div className="flex flex-col gap-2.5">
          {SCHEDULED_PAYMENTS.map((payment) => (
            <div key={`${payment.date}-${payment.amount}`} className="account-payment-row">
              <div className="flex flex-col">
                <span className="account-payment-date">{payment.date}</span>
                <span className="account-payment-method">{payment.method}</span>
              </div>
              <div className="account-payment-right">
                <span className={`account-status-pill ${payment.status}`}>{STATUS_PILL_LABEL[payment.status]}</span>
                <span className="account-payment-amount">{formatPrice(payment.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Cuenta Bancaria</p>
        <div className="account-bank-card">
          <div className="account-bank-icon">
            <BankIcon />
          </div>
          <div className="flex flex-col">
            <span className="account-bank-name">BBVA México</span>
            <span className="account-bank-mask">•••• 4821</span>
          </div>
          <span className="account-bank-verified">Verificada</span>
        </div>
      </div>
    </div>
  )
}

export function CuentaPagosScreen() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/perfil/pagos" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Cuenta de Pagos
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <CuentaContent />
        </div>

        <SellerBottomNav active="perfil" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/perfil/pagos"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Cuenta de Pagos
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <CuentaContent />
          </div>
        </div>
      </div>
    </>
  )
}
