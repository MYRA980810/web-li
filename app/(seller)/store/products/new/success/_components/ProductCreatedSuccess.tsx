'use client'

import Link from 'next/link'
import { Ambient } from '@/components/Ambient'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',   active: false, href: '/home' },
  { icon: '🛍',  label: 'Store',  active: true,  href: '/store' },
  { icon: null,  label: 'Live',   active: false, isLive: true },
  { icon: '💰',  label: 'Ventas', active: false, href: null },
  { icon: '👤',  label: 'Perfil', active: false, href: null },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.isLive ? (
          <button key="live" className="bottom-nav-live" aria-label="Live">⚡</button>
        ) : item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={`bottom-nav-item${item.active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.12em]">{item.label}</span>
          </Link>
        ) : (
          <button
            key={item.label}
            className={`bottom-nav-item${item.active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.12em]">{item.label}</span>
          </button>
        )
      )}
    </nav>
  )
}

export function ProductCreatedSuccess() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-16 flex flex-col items-center gap-6 reveal d1">
          <div className="store-success-circle">
            <span className="text-[48px] font-bold text-brand-400">✓</span>
          </div>

          <div className="text-center flex flex-col gap-3">
            <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
              ¡Producto Creado<br />con Éxito!
            </h1>
            <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
              Tu producto ya está disponible en tu stock y listo para ser lanzado en tu próximo Live.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/store"
              className="live-launch-btn w-full justify-center text-[14px]"
            >
              Ver en Stock
            </Link>
            <Link
              href="/store/products/new"
              className="btn-ghost w-full justify-center text-[13px] tracking-[0.06em] uppercase"
            >
              Añadir Otro
            </Link>
          </div>
        </div>

        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-center justify-center py-16 px-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
            <div className="store-success-circle">
              <span className="text-[48px] font-bold text-brand-400">✓</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="font-display font-extrabold text-[32px] leading-tight tracking-[-0.03em] text-(--ink-0)">
                ¡Producto Creado<br />con Éxito!
              </h1>
              <p className="text-[14px] text-(--ink-2) leading-relaxed">
                Tu producto ya está disponible en tu stock y listo para ser lanzado en tu próximo Live.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/store"
                className="live-launch-btn w-full justify-center text-[14px]"
              >
                Ver en Stock
              </Link>
              <Link
                href="/store/products/new"
                className="btn-ghost w-full justify-center text-[13px] tracking-[0.06em] uppercase"
              >
                Añadir Otro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
