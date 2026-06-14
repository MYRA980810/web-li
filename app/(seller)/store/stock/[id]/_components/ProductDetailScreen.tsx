'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import type { ProductView } from '@/lib/types'

function formatPrice(price: number, currency: string): string {
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function ImageGallery({ product }: { product: ProductView }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const images = product.images.slice().sort((a, b) => a.position - b.position)

  if (images.length === 0) {
    return (
      <div className="product-detail-hero">
        <div className="product-detail-hero-emoji">📦</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="product-detail-hero">
        <Image
          src={images[activeIdx]!.url}
          alt={product.name}
          width={480}
          height={220}
          className="product-detail-hero-img"
        />
      </div>
      {images.length > 1 && (
        <div className="product-gallery-thumbs">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              className={`product-gallery-thumb${activeIdx === idx ? ' active' : ''}`}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={`${product.name} ${idx + 1}`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">📦</span>
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold text-(--ink-0)">Producto no encontrado</p>
        <p className="text-[14px] text-(--ink-3)">Este producto no existe en tu stock.</p>
      </div>
      <Link href="/store/stock" className="live-launch-btn text-[14px]">
        Volver al Stock
      </Link>
    </div>
  )
}

function DetailContent({ product }: { product: ProductView }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero — image gallery with thumbnails */}
      <ImageGallery product={product} />

      {/* Name + status + category */}
      <div className="product-detail-section flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[18px] font-bold text-(--ink-0) leading-snug">{product.name}</p>
            {product.categoryName && (
              <p className="text-[12px] text-(--ink-3)">{product.categoryName}</p>
            )}
          </div>
          <span className={`product-detail-status-chip shrink-0 ${product.active ? 'active' : 'inactive'}`}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: product.active ? '#4ade80' : '#f87171' }}
            />
            {product.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Stock stats */}
      <div className="flex gap-3">
        <div className="product-detail-stat-card">
          <span className="product-detail-stat-value">{product.stock.totalQuantity}</span>
          <span className="product-detail-stat-label">Stock Total</span>
        </div>
        <div className="product-detail-stat-card">
          <span className="product-detail-stat-value">{product.stock.availableQuantity}</span>
          <span className="product-detail-stat-label">Disponible</span>
        </div>
        <div className="product-detail-stat-card">
          <span className="product-detail-stat-value">{product.stock.reservedQuantity}</span>
          <span className="product-detail-stat-label">Reservado</span>
        </div>
      </div>

      {/* SKU + Precio Base */}
      <div className="product-detail-section">
        <p className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase mb-3">
          Información del Producto
        </p>
        <div className="flex flex-col">
          {product.sku && (
            <div className="product-detail-info-row">
              <span className="product-detail-row-label">SKU</span>
              <span className="product-detail-row-value font-mono text-[12px] text-(--ink-1)">
                {product.sku}
              </span>
            </div>
          )}
          {product.categoryName && (
            <div className="product-detail-info-row">
              <span className="product-detail-row-label">Categoría</span>
              <span className="product-detail-row-value">{product.categoryName}</span>
            </div>
          )}
          <div className="product-detail-info-row">
            <span className="product-detail-row-label">Precio Base</span>
            <span className="product-detail-price-big">
              {formatPrice(product.basePrice, product.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Variants */}
      {product.variants.length > 1 && (
        <div className="product-detail-section">
          <p className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase mb-3">
            Variantes ({product.variants.length})
          </p>
          <div className="flex flex-col">
            {product.variants.map((v) => (
              <div key={v.id} className="product-detail-info-row">
                <span className="product-detail-row-label">
                  {v.options.map((o) => o.value).join(' / ') || 'Default'}
                </span>
                <span className="product-detail-row-value text-brand-400 font-bold">
                  {formatPrice(v.effectivePrice, product.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div className="product-detail-section flex flex-col gap-2">
          <p className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">
            Descripción
          </p>
          <p className="text-[14px] text-(--ink-2) leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Edit CTA */}
      <Link
        href={`/store/stock/${product.id}/edit`}
        className="live-launch-btn w-full justify-center text-[13px] tracking-[0.06em] uppercase"
      >
        Editar Producto
      </Link>

      <Link
        href={`/store/stock/${product.id}/delete`}
        className="text-[12px] font-semibold text-red-400/60 text-center py-1 hover:text-red-400 transition-colors tracking-[0.08em] uppercase"
      >
        Eliminar producto
      </Link>
    </div>
  )
}

type Props = { product: ProductView | null }

export function ProductDetailScreen({ product }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store/stock" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Producto
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Detalle del Producto
            </span>
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          {product ? <DetailContent product={product} /> : <NotFound />}
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/store/stock"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Gestión de Producto
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Detalle del Producto
            </span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            {product ? <DetailContent product={product} /> : <NotFound />}
          </div>
        </div>
      </div>
    </>
  )
}
