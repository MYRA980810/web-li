import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { AccountStatusBanner } from '@/components/AccountStatusBanner'
import { bannerStatus, formatMoney } from '@/lib/payoutAccountFormat'
import type { PayoutPage, SellerPayoutAccountDetails } from '@/lib/profileActions'
import { RefreshButton } from './RefreshButton'
import { ConnectAccountCta } from './ConnectAccountCta'

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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7.2l2.6 2.6L11 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 8L10 3.5 17.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 8v7.5M7 8v7.5M13 8v7.5M16.5 8v7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 15.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const CHECK_ITEMS: { key: 'connected' | 'chargesEnabled' | 'payoutsEnabled' | 'detailsSubmitted'; label: string }[] = [
  { key: 'connected', label: 'Conectado' },
  { key: 'chargesEnabled', label: 'Cobros habilitados' },
  { key: 'payoutsEnabled', label: 'Pagos habilitados' },
  { key: 'detailsSubmitted', label: 'Datos enviados' },
]

const PAYOUT_STATUS_LABEL: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  in_transit: 'En camino',
  canceled: 'Cancelado',
  failed: 'Fallido',
}

const PAYOUT_STATUS_PILL: Record<string, string> = {
  paid: 'paid',
  pending: 'waiting',
  in_transit: 'scheduled',
  canceled: 'waiting',
  failed: 'waiting',
}

function formatArrivalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CuentaContent({ details, payouts }: { details: SellerPayoutAccountDetails; payouts: PayoutPage }) {
  const status = bannerStatus(details)
  const pastDueSet = new Set(details.pastDue)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Cuenta de Pagos</span>
        <RefreshButton />
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display font-extrabold text-[24px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          {details.businessName ?? 'Sin nombre registrado'}
        </h1>
        {(details.businessUrl || details.email) && (
          <p className="text-[12px] text-(--ink-3)">{[details.businessUrl, details.email].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      <AccountStatusBanner status={status} />
      {details.disabledReason && <p className="text-[12px] text-brand-400">{details.disabledReason}</p>}

      {!details.connected ? (
        <ConnectAccountCta />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Estado de la Cuenta</p>
            <div className="account-check-grid">
              {CHECK_ITEMS.map(({ key, label }) => {
                const ok = details[key]
                return (
                  <div key={key} className="account-check-chip">
                    <div className={`account-check-dot ${ok ? 'ok' : 'fail'}`}>{ok ? <CheckIcon /> : <CrossIcon />}</div>
                    <span className="account-check-label">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {(details.currentlyDue.length > 0 || details.pastDue.length > 0) && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Pendientes</p>
              <div className="flex flex-col gap-2.5">
                {details.pastDue.map((item) => (
                  <div key={item} className="account-payment-row">
                    <span className="account-payment-method text-(--ink-0)">{item}</span>
                    <span className="account-status-pill waiting">Vencido</span>
                  </div>
                ))}
                {details.currentlyDue
                  .filter((item) => !pastDueSet.has(item))
                  .map((item) => (
                    <div key={item} className="account-payment-row">
                      <span className="account-payment-method text-(--ink-0)">{item}</span>
                      <span className="account-status-pill scheduled">Pendiente</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Balance</p>
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
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Pagos Recientes</p>
            {payouts.items.length === 0 ? (
              <p className="text-[12px] text-(--ink-3)">Todavía no hay pagos registrados.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {payouts.items.map((payout) => (
                  <div key={payout.id} className="account-payment-row">
                    <div className="flex flex-col">
                      <span className="account-payment-date">{formatArrivalDate(payout.arrivalDate)}</span>
                      <span className="account-payment-method">{payout.method}</span>
                    </div>
                    <div className="account-payment-right">
                      <span className={`account-status-pill ${PAYOUT_STATUS_PILL[payout.status] ?? 'waiting'}`}>
                        {PAYOUT_STATUS_LABEL[payout.status] ?? payout.status}
                      </span>
                      <span className="account-payment-amount">{formatMoney(payout.amount, payout.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {details.bankName && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">Cuenta Bancaria</p>
              <div className="account-bank-card">
                <div className="account-bank-icon">
                  <BankIcon />
                </div>
                <div className="flex flex-col">
                  <span className="account-bank-name">{details.bankName}</span>
                  <span className="account-bank-mask">{details.bankLast4 ? `•••• ${details.bankLast4}` : 'Sin datos'}</span>
                </div>
                {details.bankAccountStatus === 'verified' && <span className="account-bank-verified">Verificada</span>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export type CuentaPagosScreenProps = {
  details: SellerPayoutAccountDetails | null
  payouts: PayoutPage
}

export function CuentaPagosScreen({ details, payouts }: CuentaPagosScreenProps) {
  const body = details ? (
    <CuentaContent details={details} payouts={payouts} />
  ) : (
    <p className="text-[12px] text-(--ink-3)">No pudimos cargar la información de tu cuenta. Probá actualizar la página.</p>
  )

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

        <div className="px-5 pt-6 pb-2 reveal d1">{body}</div>

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
          <div className="w-full max-w-sm">{body}</div>
        </div>
      </div>
    </>
  )
}
