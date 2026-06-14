'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import type { StoreResponse } from '@/lib/storeActions'

type Props = { store: StoreResponse }

const PauseIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="5" y="4" width="4" height="14" rx="2" fill={color} />
    <rect x="13" y="4" width="4" height="14" rx="2" fill={color} />
  </svg>
)

const PlayIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M7 4.5L18 11 7 17.5V4.5z" fill={color} />
  </svg>
)

const TrashIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M3 6h16M8 6V4h6v2M19 6l-1 13H4L3 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 10v5M13 10v5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function OptionCard({
  href,
  icon,
  iconBg,
  iconBorder,
  label,
  description,
  borderColor,
  glowColor,
}: {
  href: string
  icon: React.ReactNode
  iconBg: string
  iconBorder: string
  label: string
  description: string
  borderColor: string
  glowColor?: string
}) {
  return (
    <Link
      href={href}
      className="store-manage-option-card"
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: glowColor ? `0 4px 24px -8px ${glowColor}` : undefined,
      }}
    >
      <div
        className="store-manage-option-icon"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-[14px] font-bold text-(--ink-0) leading-snug">{label}</span>
        <span className="text-[12px] text-(--ink-3) leading-relaxed">{description}</span>
      </div>
      <span className="text-(--ink-3) flex-shrink-0">
        <ChevronRight />
      </span>
    </Link>
  )
}

function StatusChip({ isActive, isClosed }: { isActive: boolean; isClosed: boolean }) {
  const styles = !isActive
    ? { bg: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', dot: '#f87171', label: 'Inactiva' }
    : isClosed
      ? { bg: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.28)', color: '#fbbf24', dot: '#fbbf24', label: 'Cerrada temporalmente' }
      : { bg: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', dot: '#4ade80', label: 'Activa' }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.10em] uppercase px-2.5 py-1 rounded-full"
      style={{ background: styles.bg, border: styles.border, color: styles.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: styles.dot }} />
      {styles.label}
    </span>
  )
}

function ManageContent({ store }: Props) {
  const isActive = store.active && !store.suspended
  const isClosed = store.temporarilyClosed

  return (
    <div className="flex flex-col gap-6">

      {/* ── Store identity card ── */}
      <div className="store-manage-store-card">
        <div
          className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid var(--brand-400)',
            boxShadow: '0 0 24px rgba(255,31,135,0.30)',
          }}
        >
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[28px]">🛍</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[17px] font-bold text-(--ink-0) leading-snug">{store.name}</p>
          <StatusChip isActive={isActive} isClosed={isClosed} />
        </div>

        <p className="text-[12px] text-(--ink-3) leading-relaxed max-w-[220px]">
          Desde aquí podés controlar la visibilidad y el estado de tu tienda en la plataforma.
        </p>
      </div>

      {/* ── Visibility section ── */}
      {isActive && (
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">
            Visibilidad
          </p>
          {isClosed ? (
            <OptionCard
              href="/store/manage/close"
              icon={<PlayIcon color="#4ade80" />}
              iconBg="rgba(34,197,94,0.14)"
              iconBorder="rgba(34,197,94,0.30)"
              label="Reabrir tienda"
              description="Volvé a publicar tu tienda para que los compradores puedan encontrarla."
              borderColor="rgba(34,197,94,0.22)"
              glowColor="rgba(34,197,94,0.15)"
            />
          ) : (
            <OptionCard
              href="/store/manage/close"
              icon={<PauseIcon color="#fbbf24" />}
              iconBg="rgba(245,158,11,0.14)"
              iconBorder="rgba(245,158,11,0.30)"
              label="Cerrar temporalmente"
              description="Ocultá tu tienda sin perder tus datos. Podés reactivarla cuando quieras."
              borderColor="rgba(245,158,11,0.22)"
              glowColor="rgba(245,158,11,0.12)"
            />
          )}
        </div>
      )}

      {/* ── Danger zone ── */}
      {isActive && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase px-0.5" style={{ color: 'rgba(239,68,68,0.60)' }}>
              Zona de peligro
            </p>
            <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.14)' }} />
          </div>
          <OptionCard
            href="/store/manage/delete"
            icon={<TrashIcon color="#f87171" />}
            iconBg="rgba(239,68,68,0.12)"
            iconBorder="rgba(239,68,68,0.28)"
            label="Eliminar tienda permanentemente"
            description="Eliminá todos los datos de tu tienda. Esta acción no se puede deshacer."
            borderColor="rgba(239,68,68,0.20)"
            glowColor="rgba(239,68,68,0.10)"
          />
        </div>
      )}

      {/* ── Already inactive ── */}
      {!isActive && (
        <div
          className="flex items-start gap-3 px-4 py-4 rounded-[var(--r-lg)] text-[13px]"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          <span className="text-(--ink-2) leading-relaxed">
            Esta tienda ya no está disponible. La reactivación debe realizarse desde el panel de administración.
          </span>
        </div>
      )}

    </div>
  )
}

export function StoreManageScreen({ store }: Props) {
  const router = useRouter()

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <button
            className="store-back-btn"
            onClick={() => router.back()}
            aria-label="Volver"
          >
            ←
          </button>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Mi Tienda
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Gestión de Estado
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <ManageContent store={store} />
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <button
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors bg-none border-none cursor-pointer"
            onClick={() => router.back()}
          >
            ← Volver
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Tienda</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Gestión de Estado
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <ManageContent store={store} />
          </div>
        </div>
      </div>
    </>
  )
}
