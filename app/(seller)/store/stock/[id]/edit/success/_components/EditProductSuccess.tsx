'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',    active: false, href: '/home' },
  { icon: '📦', label: 'Stock',   active: true,  href: '/store/stock' },
  { icon: '📊', label: 'Ventas',  active: false, href: null },
  { icon: '👤', label: 'Perfil',  active: false, href: null },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.href ? (
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

function SuccessContent({ productId }: { productId: string }) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="store-success-circle">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M10 20.5L16.5 27L30 14"
            stroke="#ff1f87"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          ¡Cambios<br />Guardados!
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          La información del producto ha sido actualizada correctamente en tu stock.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => router.replace(`/store/stock/${productId}`)}
          className="live-launch-btn w-full justify-center text-[14px]"
        >
          Volver al Detalle
        </button>
        <Link
          href="/store/stock"
          className="btn-ghost w-full justify-center text-[13px] tracking-[0.06em] uppercase"
        >
          Ir al Stock
        </Link>
      </div>

      {/* Sync indicator */}
      <div className="edit-success-sync w-full">
        <div
          className="w-8 h-8 rounded-[var(--r-md)] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,31,135,0.10)', border: '1px solid rgba(255,31,135,0.20)' }}
        >
          <span className="text-[14px]">📦</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-[0.10em] text-brand-400 uppercase">
            Producto Sincronizado
          </p>
          <p className="text-[12px] text-(--ink-3) truncate">
            Los cambios ya están activos en tu tienda
          </p>
        </div>
        <div className="stock-live-dot flex-shrink-0" />
      </div>
    </div>
  )
}

type Props = { productId: string }

export function EditProductSuccess({ productId }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-16 flex flex-col items-center gap-6 reveal d1">
          <SuccessContent productId={productId} />
        </div>
        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-center justify-center py-16 px-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <SuccessContent productId={productId} />
          </div>
        </div>
      </div>
    </>
  )
}
