'use client'

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

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 8.3L4 3.5h12l1 4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.3a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.2 8.3V16h11.6V8.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 16v-4.3h4V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2 5.5h9v8H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M11 8.3h4l3 3v2.2h-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="6" cy="15.3" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14.8" cy="15.3" r="1.6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

function DireccionesContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Mis Ubicaciones</span>
        <h1 className="font-display font-extrabold text-[24px] leading-[1.15] tracking-[-0.02em] text-(--ink-0)">
          Gestioná tus puntos de envío
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="address-card">
          <div className="address-card-top">
            <div className="address-icon home">🏠</div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-(--ink-0)">Home</span>
                <span className="address-badge-primary">Principal</span>
              </div>
              <p className="address-text">
                Avenida Insurgentes Sur 1234, Torre B, Piso 5. Ciudad de México, CP 03100.
              </p>
            </div>
          </div>
          <div className="address-actions">
            <span className="address-link-edit">Editar</span>
            <span className="address-link-delete">Eliminar</span>
          </div>
        </div>

        <div className="address-card">
          <div className="address-card-top">
            <div className="address-icon office">💼</div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[13px] font-bold text-(--ink-0)">Office</span>
              <p className="address-text">
                Paseo de la Reforma 250, Edificio Capital, Oficina 1201. Juárez, CP 06600.
              </p>
            </div>
          </div>
          <div className="address-actions">
            <span className="address-link-edit">Editar</span>
            <span className="address-link-delete">Eliminar</span>
          </div>
        </div>
      </div>

      <button type="button" className="live-launch-btn w-full justify-center" disabled>
        <span className="mr-1.5">＋</span>
        Agregar Nueva Dirección
      </button>

      <div className="address-suggestions-card">
        <span className="address-suggestions-title">Sugerencias cercanas</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="address-suggestion-card">
            <span className="address-suggestion-icon-box">
              <StoreIcon />
            </span>
            <span className="address-suggestion-label">Puntos de Pick-up</span>
          </div>
          <div className="address-suggestion-card">
            <span className="address-suggestion-icon-box">
              <TruckIcon />
            </span>
            <span className="address-suggestion-label">Centros de Envío</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DireccionesScreen() {
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
              Direcciones
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="px-5 pt-6 pb-2 reveal d1">
          <DireccionesContent />
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
              Direcciones
            </span>
          </div>
          <button type="button" className="home-nav-icon opacity-50 cursor-not-allowed" aria-label="Configuración" disabled>
            <GearIcon />
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <DireccionesContent />
          </div>
        </div>
      </div>
    </>
  )
}
