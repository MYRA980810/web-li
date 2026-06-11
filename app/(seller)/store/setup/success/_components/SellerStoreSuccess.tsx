'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

function SuccessContent() {
  const searchParams = useSearchParams()
  const storeName = searchParams.get('name') ?? 'Tu Tienda'

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
              Tienda Creada<br />con Éxito
            </h1>
            <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
              ¡Felicidades! Tu tienda{' '}
              <strong className="text-brand-400">&apos;{storeName.toUpperCase()}&apos;</strong>{' '}
              ha sido configurada correctamente.
            </p>
            <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
              Ahora es momento de cargar tus primeros productos para empezar a vender en tus
              próximos Lives.
            </p>
          </div>

          <button className="live-launch-btn w-full justify-center text-[14px]">
            Cargar Productos
          </button>
        </div>

        <div className="px-5 mt-8 reveal d2">
          <div className="store-tips-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="store-tips-icon-wrap">📱</div>
              <p className="font-display font-bold text-[14px] text-(--ink-0) tracking-[-0.02em]">
                Tips para tu primer Live
              </p>
            </div>
            <p className="text-[13px] text-(--ink-3) leading-relaxed">
              Asegurate de que tus productos tengan descripciones claras y precios competitivos
              para incentivar las compras impulsivas durante la transmisión.
            </p>
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
                Tienda Creada<br />con Éxito
              </h1>
              <p className="text-[14px] text-(--ink-2) leading-relaxed">
                ¡Felicidades! Tu tienda{' '}
                <strong className="text-brand-400">&apos;{storeName.toUpperCase()}&apos;</strong>{' '}
                ha sido configurada correctamente.
              </p>
              <p className="text-[13px] text-(--ink-3) leading-relaxed">
                Ahora es momento de cargar tus primeros productos para empezar a vender en tus
                próximos Lives.
              </p>
            </div>

            <button className="live-launch-btn justify-center text-[14px]">
              Cargar Productos
            </button>

            <div className="store-tips-card w-full text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="store-tips-icon-wrap">📱</div>
                <p className="font-display font-bold text-[14px] text-(--ink-0) tracking-[-0.02em]">
                  Tips para tu primer Live
                </p>
              </div>
              <p className="text-[13px] text-(--ink-3) leading-relaxed">
                Asegurate de que tus productos tengan descripciones claras y precios competitivos
                para incentivar las compras impulsivas durante la transmisión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function SellerStoreSuccess() {
  return <SuccessContent />
}
