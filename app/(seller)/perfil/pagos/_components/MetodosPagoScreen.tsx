import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { AccountStatusBanner } from '@/components/AccountStatusBanner'
import { bannerStatus, formatMoney } from '@/lib/payoutAccountFormat'
import type { SellerPayoutAccountDetails } from '@/lib/profileActions'

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

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 8L10 3.5 17.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 8v7.5M7 8v7.5M13 8v7.5M16.5 8v7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 15.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function PagosContent({ details }: { details: SellerPayoutAccountDetails | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Cuenta de Pagos</span>
        <h1 className="font-display font-extrabold text-[24px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          Gestionar Pagos
        </h1>
      </div>

      {details ? (
        <>
          <AccountStatusBanner status={bannerStatus(details)} />

          {details.connected ? (
            <Link href="/perfil/pagos/cuenta" className="account-bank-card">
              <div className="account-bank-icon">
                <BankIcon />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="account-bank-name truncate">{details.businessName ?? 'Cuenta conectada'}</span>
                <span className="account-bank-mask truncate">
                  {details.bankName
                    ? `${details.bankName}${details.bankLast4 ? ` •••• ${details.bankLast4}` : ''}`
                    : 'Ver detalle de la cuenta'}
                </span>
              </div>
              <span className="text-(--ink-3) ml-auto">›</span>
            </Link>
          ) : (
            <Link href="/perfil/pagos/cuenta" className="live-launch-btn w-full justify-center text-[14px]">
              Conectar cuenta de pagos
            </Link>
          )}

          {details.connected && (
            <div className="account-balance-grid">
              <div className="account-balance-card">
                <span className="account-balance-label">Disponible</span>
                <span className="account-balance-value">
                  {details.balanceAvailable.length > 0
                    ? details.balanceAvailable.map((b) => formatMoney(b.amount, b.currency)).join(' + ')
                    : '—'}
                </span>
              </div>
              <div className="account-balance-card">
                <span className="account-balance-label">En camino</span>
                <span className="account-balance-value">
                  {details.balancePending.length > 0
                    ? details.balancePending.map((b) => formatMoney(b.amount, b.currency)).join(' + ')
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[12px] text-(--ink-3)">No pudimos cargar la información de tu cuenta.</p>
      )}

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

export function MetodosPagoScreen({ details }: { details: SellerPayoutAccountDetails | null }) {
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
          <PagosContent details={details} />
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
            <PagosContent details={details} />
          </div>
        </div>
      </div>
    </>
  )
}
