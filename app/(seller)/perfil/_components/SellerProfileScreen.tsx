'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { logout } from '@/lib/actions'
import type { UserProfile } from '@/lib/profileActions'

export type SellerProfileScreenProps = { productCount: number; profile: UserProfile | null }
type Props = SellerProfileScreenProps

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="2.5" y="6" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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

function SettingItem({
  icon,
  label,
  description,
  locked,
}: {
  icon: string
  label: string
  description: string
  locked: boolean
}) {
  return (
    <div className={`profile-setting-item ${locked ? 'locked' : 'active'}`}>
      <div className="profile-setting-icon text-[18px]">{icon}</div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[13px] font-bold text-(--ink-0) leading-snug">{label}</span>
        <span className="text-[11px] text-(--ink-3) leading-relaxed">{description}</span>
      </div>
      <span className="text-(--ink-3) flex-shrink-0">
        {locked ? <LockIcon /> : <ChevronRight />}
      </span>
    </div>
  )
}

function ProfileContent({ productCount, profile }: Props) {
  const isComplete = !!profile?.profileComplete
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Usuario'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="relative">
          <div className="profile-avatar">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Foto de perfil"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[40px]">👤</span>
            )}
          </div>
          <button type="button" className="profile-avatar-edit-badge" aria-label="Editar foto" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h1 className="font-display font-extrabold text-[22px] leading-tight tracking-[-0.02em] text-(--ink-0)">
            {displayName}
          </h1>
          {isComplete ? (
            <span className="profile-status-chip verified">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-400)' }} />
              Perfil Verificado
            </span>
          ) : (
            <span className="profile-status-chip pending">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} />
              Perfil Pendiente
            </span>
          )}
        </div>
      </div>

      {!isComplete && (
        <div className="profile-action-card">
          <span className="profile-action-label">⚠ Acción Requerida</span>
          <p className="text-[13px] text-(--ink-2) leading-relaxed">
            ¡Tu perfil está incompleto! Completalo ahora para poder vender en los lives.
          </p>
          <Link href="/perfil/completar" className="live-launch-btn w-full justify-center text-[13px]">
            Completar
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">
          Configuración de Cuenta
        </p>

        <SettingItem
          icon="💳"
          label="Datos Bancarios"
          description="Para recibir tus pagos"
          locked
        />
        <SettingItem
          icon="🏪"
          label="Datos de la Tienda"
          description="Información de tu negocio"
          locked
        />
        <SettingItem
          icon="🔔"
          label="Notificaciones"
          description="Alertas y avisos"
          locked
        />
        <SettingItem
          icon="🛡"
          label="Seguridad y Privacidad"
          description="Gestioná tu cuenta"
          locked
        />
        <SettingItem
          icon="❓"
          label="Centro de Ayuda"
          description="¿Tienes alguna duda?"
          locked={false}
        />
      </div>

      <form action={logout}>
        <button type="submit" className="profile-logout-btn">
          Cerrar Sesión
        </button>
      </form>

      <div className="flex gap-3">
        <div className="profile-stat-card">
          <span className="profile-stat-value">{productCount}</span>
          <span className="profile-stat-label">Productos</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">0</span>
          <span className="profile-stat-label">Ventas</span>
        </div>
      </div>
    </div>
  )
}

export function SellerProfileScreen({ productCount, profile }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/home" className="store-back-btn" aria-label="Volver">←</Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Mi Cuenta
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Perfil
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <ProfileContent productCount={productCount} profile={profile} />
        </div>

        <SellerBottomNav active="perfil" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/home"
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">Perfil</span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <ProfileContent productCount={productCount} profile={profile} />
          </div>
        </div>
      </div>
    </>
  )
}
