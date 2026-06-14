'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { setStoreActive } from '@/lib/storeActions'

function DeleteContent() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  function handleDelete() {
    if (!confirmed) return
    setError(null)
    startTransition(async () => {
      const result = await setStoreActive(false)
      if (result.ok) {
        router.replace('/store/manage/delete/success')
      } else {
        setError(result.error ?? 'Ocurrió un error inesperado')
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div className="delete-confirm-icon">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path
            d="M9 9L25 25M25 9L9 25"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          Eliminar Tienda<br />Permanentemente
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Esta acción eliminará tu tienda de forma definitiva. No podrás recuperarla.
        </p>
      </div>

      {/* Warning box */}
      <div className="store-manage-warning-box w-full text-left">
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-red-400 mb-2">
          Advertencia — Acción irreversible
        </p>
        <ul className="flex flex-col gap-1.5 text-[13px] text-(--ink-2) leading-relaxed">
          <li>• Todos los datos de tu tienda serán eliminados.</li>
          <li>• Tus productos y su historial no estarán disponibles.</li>
          <li>• Las ventas pendientes podrían verse afectadas.</li>
          <li>• No podrás reactivar esta tienda.</li>
        </ul>
      </div>

      {/* Confirmation checkbox */}
      <label
        className="flex items-start gap-3 cursor-pointer w-full text-left px-1"
        htmlFor="confirm-delete"
      >
        <input
          id="confirm-delete"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-red-500 cursor-pointer"
        />
        <span className="text-[13px] text-(--ink-2) leading-relaxed">
          Entiendo que esta acción es permanente e irreversible.
        </span>
      </label>

      {error && (
        <p className="text-[13px] text-red-400 text-center w-full">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleDelete}
          disabled={isPending || !confirmed}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[var(--r-pill)] text-[13px] font-bold tracking-[0.06em] uppercase transition-all"
          style={{
            background: confirmed ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.06)',
            border: confirmed ? '1px solid rgba(239,68,68,0.44)' : '1px solid rgba(239,68,68,0.18)',
            color: confirmed ? '#f87171' : 'rgba(248,113,113,0.4)',
            opacity: isPending ? 0.6 : 1,
            cursor: !confirmed ? 'not-allowed' : 'pointer',
            transition: 'all .2s',
          }}
        >
          {isPending ? 'Eliminando...' : 'Eliminar para siempre'}
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

export function ConfirmDeleteScreen() {
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
              Eliminar Tienda
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-8 pb-2 reveal d1">
          <DeleteContent />
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
              Eliminar Tienda
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            <DeleteContent />
          </div>
        </div>
      </div>
    </>
  )
}
