'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { deactivateProduct } from '@/lib/productActions'
import type { ProductView } from '@/lib/types'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',   active: false, href: '/home' },
  { icon: '🛍',  label: 'Store',  active: true,  href: '/store' },
  { icon: null,  label: 'Live',   active: false, isLive: true  },
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
  const [error, setError] = useState<string | null>(null)

  const imageUrl =
    product.images.find((img) => img.primary)?.url ??
    product.images[0]?.url ??
    null

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deactivateProduct(product.id)
      if (result.ok) {
        router.replace(`/store/stock/${product.id}/delete/success`)
      } else {
        setError(result.error)
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
          ¿Eliminar<br />Producto?
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Esta acción no se puede deshacer. El producto será removido
          permanentemente de tu stock.
        </p>
      </div>

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
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-400 text-center w-full">{error}</p>
      )}

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="live-launch-btn w-full justify-center text-[13px] tracking-[0.06em] uppercase"
          style={{ opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Eliminando...' : 'Eliminar Producto'}
        </button>
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

        <BottomNav />
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
