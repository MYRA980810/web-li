'use client'

import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

function SuccessContent() {
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
        <h1 className="font-display font-extrabold text-[32px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          ¡Producto<br />Eliminado!
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          El producto ha sido removido exitosamente de tu inventario. Esta
          acción no se puede deshacer.
        </p>
      </div>

      <Link
        href="/store/stock"
        className="live-launch-btn w-full justify-center text-[14px]"
      >
        Regresar a Stock →
      </Link>
    </div>
  )
}

export function DeleteProductSuccess() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-[11px] font-bold tracking-[0.18em] text-brand-400 uppercase">
            Stock
          </span>
        </div>

        <div className="px-5 pt-10 flex flex-col items-center gap-6 reveal d1">
          <SuccessContent />
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-center justify-center py-16 px-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <SuccessContent />
          </div>
        </div>
      </div>
    </>
  )
}
