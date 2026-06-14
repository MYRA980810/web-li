'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { reopenStore } from '@/lib/storeActions'

function SuccessContent() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleReopen() {
    setError(null)
    startTransition(async () => {
      const result = await reopenStore()
      if (result.ok) {
        router.replace('/store')
      } else {
        setError(result.error ?? 'Ocurrió un error inesperado')
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div className="store-manage-amber-circle">
        <span className="text-[42px] leading-none">⏸</span>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          Tienda Cerrada<br />Temporalmente
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Tu tienda ya no es visible para los compradores. Podés reactivarla cuando quieras.
        </p>
      </div>

      {/* Info box */}
      <div
        className="w-full text-left flex flex-col gap-2 px-4 py-4 rounded-[var(--r-lg)]"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}
      >
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: '#fbbf24' }}>
          Estado actual
        </p>
        <ul className="flex flex-col gap-1.5 text-[13px] text-(--ink-2) leading-relaxed">
          <li>• Tu tienda está oculta para los compradores.</li>
          <li>• Tus productos y datos están seguros.</li>
          <li>• Podés reabrir en cualquier momento.</li>
        </ul>
      </div>

      {error && (
        <p className="text-[13px] text-red-400 text-center w-full">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleReopen}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[var(--r-pill)] text-[13px] font-bold tracking-[0.06em] uppercase transition-all"
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.30)',
            color: '#4ade80',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? 'Reabriendo...' : 'Reabrir ahora'}
        </button>

        <Link
          href="/store"
          className="text-[13px] font-semibold text-(--ink-2) text-center py-2 hover:text-(--ink-0) transition-colors tracking-[0.08em] uppercase"
        >
          Volver a mi tienda
        </Link>
      </div>
    </div>
  )
}

export function StoreClosedSuccess() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-16 flex flex-col items-center gap-6 reveal d1">
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
