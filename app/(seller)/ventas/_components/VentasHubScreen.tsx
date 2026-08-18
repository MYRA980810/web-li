import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

const SELLER_NAME = 'Juan Pérez'
const PERIOD_LABEL = 'JUNIO 2026'

const INCOME_TOTAL = 18420
const INCOME_TREND = '+12%'
const LIVES_INCOME = 13100
const LIVES_PERCENT = 71
const TIENDA_INCOME = 5320

const ENVIOS_HOY = 94
const ENVIOS_ALERTAS: number = 2
const VENTAS_ULTIMO_LIVE = 3840

const RING_RADIUS = 40
const RING_STROKE = 9
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="2.5" y="5.5" width="12" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14.5 9.2l5-2.9v9.4l-5-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const BagIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M6 7V5.5a5 5 0 0 1 10 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="3" y="7" width="16" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2 5.5h9v8H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M11 8.3h4l3 3v2.2h-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="6" cy="15.3" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14.8" cy="15.3" r="1.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M4 18V9.5M11 18V4M18 18v-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2.5 18h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="6" width="15" height="10.5" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="11.2" r="2.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const AlertIcon = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 3.2v4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="7" cy="10.4" r="0.9" fill="currentColor" />
  </svg>
)

function IncomeRing({ percent }: { percent: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={RING_STROKE} />
        <circle
          cx="48"
          cy="48"
          r={RING_RADIUS}
          fill="none"
          stroke="url(#ventas-ring-grad)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ventas-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-[18px] text-(--ink-0) leading-none">{percent}%</span>
        <span className="text-[8px] font-bold tracking-[0.10em] text-(--ink-3) uppercase mt-0.5">Lives</span>
      </div>
    </div>
  )
}

function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Link href="/ventas/lives" className="flex flex-col items-center gap-2">
        <span className="quick-access-icon accent">
          <VideoIcon />
        </span>
        <span className="text-[11px] font-semibold text-(--ink-1)">Lives</span>
      </Link>

      <Link href="/ventas/tienda" className="flex flex-col items-center gap-2">
        <span className="quick-access-icon accent">
          <BagIcon />
        </span>
        <span className="text-[11px] font-semibold text-(--ink-1)">Tienda</span>
      </Link>

      <div className="flex flex-col items-center gap-2">
        <button type="button" className="quick-access-icon" disabled aria-label="Envíos (próximamente)">
          <TruckIcon />
        </button>
        <span className="text-[11px] font-semibold text-(--ink-3)">Envíos</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button type="button" className="quick-access-icon" disabled aria-label="Reportes (próximamente)">
          <ChartIcon />
        </button>
        <span className="text-[11px] font-semibold text-(--ink-3)">Reportes</span>
      </div>
    </div>
  )
}

function IncomeCard() {
  return (
    <div className="income-card">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase">Ingresos Totales</span>
        <span className="income-trend-pill">↗ {INCOME_TREND}</span>
      </div>

      <span className="income-amount">
        {formatMxn(INCOME_TOTAL)} <span className="text-[15px] font-bold text-(--ink-3)">MXN</span>
      </span>

      <div className="flex items-center gap-5">
        <IncomeRing percent={LIVES_PERCENT} />

        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-(--ink-2)">Lives</span>
              <span className="font-bold text-(--ink-0)">{formatMxn(LIVES_INCOME)}</span>
            </div>
            <div className="income-bar-track">
              <div className="income-bar-fill" style={{ width: `${LIVES_PERCENT}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-(--ink-2)">Tienda</span>
              <span className="font-bold text-(--ink-0)">{formatMxn(TIENDA_INCOME)}</span>
            </div>
            <div className="income-bar-track">
              <div className="income-bar-fill muted" style={{ width: `${100 - LIVES_PERCENT}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCardsRow() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="ops-stat-card">
        <div className="flex items-start justify-between">
          <span className="ops-stat-icon" style={{ background: 'rgba(56,189,248,0.14)', color: 'var(--cyan-400)' }}>
            <TruckIcon />
          </span>
          <span className="text-(--ink-3)">›</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Envíos</span>
          <span className="ops-stat-value">{ENVIOS_HOY}</span>
          <span className="text-[11px] text-(--ink-3)">pedidos hoy</span>
        </div>
        <span className="ops-alert-pill">
          <AlertIcon /> {ENVIOS_ALERTAS} ALERTA{ENVIOS_ALERTAS === 1 ? '' : 'S'}
        </span>
      </div>

      <Link href="/ventas/lives" className="ops-stat-card">
        <div className="flex items-start justify-between">
          <span className="ops-stat-icon" style={{ background: 'rgba(255,31,135,0.14)', color: 'var(--brand-400)' }}>
            <CoinIcon />
          </span>
          <span className="text-(--ink-3)">›</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-[0.12em] text-(--ink-3) uppercase">Ventas</span>
          <span className="ops-stat-value">${(VENTAS_ULTIMO_LIVE / 1000).toFixed(1)}k</span>
          <span className="text-[11px] font-bold text-brand-400">Último Live</span>
        </div>
        <div className="flex items-center">
          {['A', 'B', 'C'].map((letter, i) => (
            <span
              key={letter}
              className="w-6 h-6 rounded-full border-2 border-(--bg-0) bg-grad-pink flex items-center justify-center text-[9px] font-bold text-[#1a0612]"
              style={{ marginLeft: i === 0 ? 0 : -8 }}
            >
              {letter}
            </span>
          ))}
          <span className="text-[11px] text-(--ink-3) ml-2">+12</span>
        </div>
      </Link>
    </div>
  )
}

function HubContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[26px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          Hola, {SELLER_NAME}
        </h1>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          <span className="text-[11px] font-bold tracking-[0.10em] text-(--ink-3) uppercase">{PERIOD_LABEL}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-[0.16em] text-(--ink-3) uppercase px-0.5">Accesos Rápidos</span>
        <QuickAccessGrid />
      </div>

      <IncomeCard />
      <StatCardsRow />
    </div>
  )
}

export function VentasHubScreen() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <span className="font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em]">Sellers Hub</span>
          <span className="google-account-avatar">{SELLER_NAME[0]}</span>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <HubContent />
        </div>

        <SellerBottomNav active="ventas" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <span className="font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em]">Sellers Hub</span>
          <span className="google-account-avatar">{SELLER_NAME[0]}</span>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <HubContent />
          </div>
        </div>
      </div>
    </>
  )
}
