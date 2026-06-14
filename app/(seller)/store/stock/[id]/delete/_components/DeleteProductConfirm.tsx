'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { deactivateProduct, pauseProduct, resumeProduct } from '@/lib/productActions'
import type { ProductView } from '@/lib/types'

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">📦</span>
      <p className="text-[18px] font-semibold text-(--ink-0)">Producto no encontrado</p>
      <Link href="/store/stock" className="live-launch-btn text-[14px]">
        Volver al Stock
      </Link>
    </div>
  )
}

function ConfirmContent({ product }: { product: ProductView }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<'pause' | 'resume' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const imageUrl =
    product.images.find((img) => img.primary)?.url ??
    product.images[0]?.url ??
    null

  const isActive = product.active
  const isPaused = product.paused

  function handlePause() {
    setError(null)
    setPendingAction('pause')
    startTransition(async () => {
      const result = await pauseProduct(product.id)
      if (result.ok) {
        router.replace(`/store/stock/${product.id}`)
      } else {
        setError(result.error)
        setPendingAction(null)
      }
    })
  }

  function handleResume() {
    setError(null)
    setPendingAction('resume')
    startTransition(async () => {
      const result = await resumeProduct(product.id)
      if (result.ok) {
        router.replace(`/store/stock/${product.id}`)
      } else {
        setError(result.error)
        setPendingAction(null)
      }
    })
  }

  function handleDelete() {
    setError(null)
    setPendingAction('delete')
    startTransition(async () => {
      const result = await deactivateProduct(product.id)
      if (result.ok) {
        router.replace(`/store/stock/${product.id}/delete/success`)
      } else {
        setError(result.error)
        setPendingAction(null)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="delete-confirm-icon">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path
            d="M9 9L25 25M25 9L9 25"
            stroke="#ff1f87"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[32px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          Estado del<br />Producto
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Pausá las ventas temporalmente o eliminá el producto de tu stock de forma permanente.
        </p>
      </div>

      {/* Product card */}
      <div className="product-detail-card w-full text-left">
        <div className="product-detail-thumb">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[28px] opacity-40">📦</span>
          )}
        </div>
        <div className="product-detail-info-block">
          <p className="text-[9px] font-bold tracking-[0.16em] text-brand-400 uppercase mb-1">
            Producto Seleccionado
          </p>
          <p className="text-[15px] font-bold text-(--ink-0) leading-snug">{product.name}</p>
          {product.categoryName && (
            <p className="text-[12px] text-(--ink-3) mt-0.5">
              Categoría: {product.categoryName}
            </p>
          )}
          <span
            className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold tracking-[0.10em] uppercase px-2 py-0.5 rounded-full"
            style={
              !isActive
                ? { background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                : isPaused
                  ? { background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.28)', color: '#fbbf24' }
                  : { background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: !isActive ? '#f87171' : isPaused ? '#fbbf24' : '#4ade80',
              }}
            />
            {!isActive ? 'Inactivo' : isPaused ? 'Pausado' : 'Activo'}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-400 text-center w-full">{error}</p>
      )}

      <div className="flex flex-col gap-3 w-full">
        {/* Pause / Resume — only when product is active */}
        {isActive && !isPaused && (
          <button
            onClick={handlePause}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[var(--r-pill)] text-[13px] font-bold tracking-[0.06em] uppercase transition-all"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.32)',
              color: '#fbbf24',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {pendingAction === 'pause' ? 'Pausando...' : 'Pausar ventas temporalmente'}
          </button>
        )}

        {isActive && isPaused && (
          <button
            onClick={handleResume}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[var(--r-pill)] text-[13px] font-bold tracking-[0.06em] uppercase transition-all"
            style={{
              background: 'rgba(34,197,94,0.10)',
              border: '1px solid rgba(34,197,94,0.28)',
              color: '#4ade80',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {pendingAction === 'resume' ? 'Reanudando...' : 'Reanudar ventas'}
          </button>
        )}

        {/* Permanent deactivation — only when product is active */}
        {isActive && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="live-launch-btn w-full justify-center text-[13px] tracking-[0.06em] uppercase"
            style={{ opacity: isPending ? 0.7 : 1 }}
          >
            {pendingAction === 'delete' ? 'Eliminando...' : 'Eliminar Producto'}
          </button>
        )}

        {!isActive && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] text-[13px]"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <span>⚠</span>
            <span className="text-(--ink-2)">
              Este producto ya está inactivo. La reactivación debe hacerse desde el panel de administración.
            </span>
          </div>
        )}

        <Link
          href={`/store/stock/${product.id}`}
          className="text-[13px] font-semibold text-(--ink-2) text-center py-2 hover:text-(--ink-0) transition-colors tracking-[0.08em] uppercase"
        >
          Cancelar
        </Link>
      </div>
    </div>
  )
}

type Props = { product: ProductView | null }

export function DeleteProductConfirm({ product }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link
            href={product ? `/store/stock/${product.id}` : '/store/stock'}
            className="store-back-btn"
            aria-label="Volver"
          >
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Producto
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Mi Stock
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-8 pb-2 reveal d1">
          {product ? <ConfirmContent product={product} /> : <NotFound />}
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href={product ? `/store/stock/${product.id}` : '/store/stock'}
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Producto
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Mi Stock
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-sm">
            {product ? <ConfirmContent product={product} /> : <NotFound />}
          </div>
        </div>
      </div>
    </>
  )
}
