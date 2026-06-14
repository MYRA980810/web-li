'use client'

import Link from 'next/link'
import { Ambient } from '@/components/Ambient'

function SuccessContent() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div
        className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.20) 0%, rgba(8,5,20,0.96) 72%)',
          border: '1px solid rgba(99,102,241,0.28)',
          boxShadow: '0 0 60px -20px rgba(99,102,241,0.45)',
        }}
      >
        <span className="text-[40px] leading-none">👋</span>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          Tienda Eliminada
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Tu tienda ha sido eliminada permanentemente. Gracias por haber sido parte de la plataforma.
        </p>
      </div>

      {/* Info box */}
      <div
        className="w-full text-left flex flex-col gap-2 px-4 py-4 rounded-[var(--r-lg)]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-(--ink-3)">
          Qué sucedió
        </p>
        <ul className="flex flex-col gap-1.5 text-[13px] text-(--ink-2) leading-relaxed">
          <li>• Todos los datos de tu tienda fueron eliminados.</li>
          <li>• Esta acción no puede revertirse.</li>
          <li>• Si querés volver a vender, podés crear una nueva tienda.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <Link
          href="/"
          className="live-launch-btn w-full justify-center text-[14px]"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

export function StoreDeletedSuccess() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-16 flex flex-col items-center gap-6 reveal d1">
          <SuccessContent />
        </div>
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
