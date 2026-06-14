'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { closeStoreTemporarily, reopenStore } from '@/lib/storeActions'

type Props = { isClosed: boolean }

function CloseContent({ isClosed }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAction() {
    setError(null)
    startTransition(async () => {
      const result = isClosed ? await reopenStore() : await closeStoreTemporarily()
      if (result.ok) {
        router.replace(isClosed ? '/store' : '/store/manage/close/success')
      } else {
        setError(result.error ?? 'Ocurrió un error inesperado')
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div className="store-manage-amber-circle">
        <span className="text-[42px] leading-none">{isClosed ? '▶' : '⏸'}</span>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          {isClosed ? 'Reabrir Tienda' : 'Cerrar Tienda\nTemporalmente'}
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          {isClosed
            ? 'Tu tienda volverá a ser visible para todos los compradores en la plataforma.'
            : 'Mientras tu tienda esté cerrada, los compradores no podrán encontrarla ni realizar compras.'}
        </p>
      </div>

      {/* Info box */}
      <div
        className="w-full text-left flex flex-col gap-2 px-4 py-4 rounded-[var(--r-lg)]"
        style={
          isClosed
            ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.20)' }
            : { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }
        }
      >
        <p
          className="text-[11px] font-bold tracking-[0.12em] uppercase"
          style={{ color: isClosed ? '#4ade80' : '#fbbf24' }}
        >
          Qué sucede
        </p>
        <ul className="flex flex-col gap-1.5 text-[13px] text-(--ink-2) leading-relaxed">
          {isClosed ? (
            <>
              <li>• Tu tienda volverá a aparecer en los resultados.</li>
              <li>• Los compradores podrán ver y comprar tus productos.</li>
              <li>• Podés volver a cerrarla cuando quieras.</li>
            </>
          ) : (
            <>
              <li>• Tu tienda quedará oculta para los compradores.</li>
              <li>• Tus productos y datos se conservan intactos.</li>
              <li>• Podés reactivarla cuando quieras desde la configuración.</li>
            </>
          )}
        </ul>
      </div>

      {error && (
        <p className="text-[13px] text-red-400 text-center w-full">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleAction}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[var(--r-pill)] text-[13px] font-bold tracking-[0.06em] uppercase transition-all"
          style={
            isClosed
              ? {
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.32)',
                  color: '#4ade80',
                  opacity: isPending ? 0.6 : 1,
                }
              : {
                  background: 'rgba(245,158,11,0.14)',
                  border: '1px solid rgba(245,158,11,0.36)',
                  color: '#fbbf24',
                  opacity: isPending ? 0.6 : 1,
                }
          }
        >
          {isPending
            ? 'Procesando...'
            : isClosed
              ? 'Reabrir tienda'
              : 'Cerrar tienda'}
        </button>

        <Link
          href="/store/manage"
          className="text-[13px] font-semibold text-(--ink-2) text-center py-2 hover:text-(--ink-0) transition-colors tracking-[0.08em] uppercase"
        >
          Cancelar
        </Link>
      </div>
    </div>
  )
}

export function ConfirmCloseScreen({ isClosed }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store/manage" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Tienda
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Estado de Visibilidad
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-8 pb-2 reveal d1">
          <CloseContent isClosed={isClosed} />
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/store/manage"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Tienda
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Estado de Visibilidad
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <CloseContent isClosed={isClosed} />
          </div>
        </div>
      </div>
    </>
  )
}
