'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="2.5" y="6" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2.5l7.5 3v5.4c0 5-3.2 8.9-7.5 10.6-4.3-1.7-7.5-5.6-7.5-10.6V5.5l7.5-3z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function SettingItem({
  icon,
  label,
  description,
  locked,
  href,
}: {
  icon: string
  label: string
  description: string
  locked: boolean
  href?: string
}) {
  const inner = (
    <>
      <div className="profile-setting-icon text-[18px]">{icon}</div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[13px] font-bold text-(--ink-0) leading-snug">{label}</span>
        <span className="text-[11px] text-(--ink-3) leading-relaxed">{description}</span>
      </div>
      <span className="text-(--ink-3) flex-shrink-0">
        {locked ? <LockIcon /> : href ? <ChevronRight /> : null}
      </span>
    </>
  )

  if (href && !locked) {
    return (
      <Link href={href} className="profile-setting-item active">
        {inner}
      </Link>
    )
  }

  return <div className={`profile-setting-item ${locked ? 'locked' : 'active'}`}>{inner}</div>
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onToggle,
}: {
  icon: string
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="profile-setting-item active">
      <div className="profile-setting-icon text-[18px]">{icon}</div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[13px] font-bold text-(--ink-0) leading-snug">{label}</span>
        <span className="text-[11px] text-(--ink-3) leading-relaxed">{description}</span>
      </div>
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

function SeguridadContent() {
  const [twoFactor, setTwoFactor] = useState(true)
  const [accountPrivacy, setAccountPrivacy] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="seller-hero-card">
        <div className="seller-hero-bg" />
        <div className="seller-hero-overlay" />
        <div className="seller-hero-body">
          <span className="text-(--ink-0)">
            <ShieldIcon />
          </span>
          <h2 className="seller-hero-title mt-2.5">
            Tu Escudo <em className="grad-text not-italic">Digital</em>
          </h2>
          <p className="text-[13px] text-(--ink-2) leading-normal mt-1.5">
            Gestioná el acceso a tu cuenta y mantené tu información bajo llave.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">
          Acceso y Seguridad
        </p>
        <SettingItem
          icon="🔑"
          label="Cambiar Contraseña"
          description="Actualizá tu contraseña de acceso"
          locked={false}
          href="/perfil/seguridad/cambiar-contrasena"
        />
        <ToggleRow
          icon="📱"
          label="Autenticación en dos pasos"
          description="Activado para mayor seguridad"
          checked={twoFactor}
          onToggle={() => setTwoFactor((v) => !v)}
        />
        <SettingItem icon="💻" label="Dispositivos Vinculados" description="3 sesiones activas" locked />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-bold tracking-[0.18em] text-(--ink-3) uppercase px-0.5">
          Privacidad de Datos
        </p>
        <ToggleRow
          icon="👁"
          label="Privacidad de Cuenta"
          description="Perfil visible para seguidores"
          checked={accountPrivacy}
          onToggle={() => setAccountPrivacy((v) => !v)}
        />
        <SettingItem icon="🍪" label="Gestión de Cookies" description="Personalizá tu experiencia publicitaria" locked />
      </div>

      <div className="danger-zone-card">
        <span className="danger-zone-title">Zona de Riesgo</span>
        <p className="text-[12px] text-(--ink-3) leading-relaxed">
          Estas acciones son permanentes y no se pueden deshacer.
        </p>
        <button type="button" className="danger-btn-outline" disabled>
          Desactivar Cuenta Temporalmente
        </button>
        <button type="button" className="danger-btn-solid" disabled>
          Eliminar Cuenta Definitivamente
        </button>
      </div>
    </div>
  )
}

export function SeguridadPrivacidadScreen() {
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
              Seguridad y Privacidad
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <SeguridadContent />
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
              Seguridad y Privacidad
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <SeguridadContent />
          </div>
        </div>
      </div>
    </>
  )
}
