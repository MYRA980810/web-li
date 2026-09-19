'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { BuyerProductCardView } from '@/lib/types'
import { formatMxn } from '@/lib/format'
import { fallbackGradient } from '@/lib/visualFallbacks'

export type BuyerProductCardProps = {
  product: BuyerProductCardView
}

export function BuyerProductCard({ product }: BuyerProductCardProps) {
  const router = useRouter()
  const [favorite, setFavorite] = useState(false)

  return (
    <div
      className="buyer-product-card"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/buyer/product/${product.id}?storeId=${product.storeId}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(`/buyer/product/${product.id}?storeId=${product.storeId}`)
      }}
    >
      <div
        className="buyer-product-card-media"
        style={product.imageUrl ? undefined : { background: fallbackGradient(product.id) }}
      >
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover" />
        )}
        {product.isLive && (
          <span className="absolute top-2 left-2 z-10 live-badge">
            <span className="dot" />
            Live
          </span>
        )}
        {product.stockLabel && <span className="buyer-stock-badge">{product.stockLabel}</span>}
        <button
          className={`buyer-fav-btn${favorite ? ' active' : ''}`}
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          onClick={(e) => {
            e.stopPropagation()
            setFavorite((prev) => !prev)
          }}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="px-3 pb-3 pt-2.5 flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-(--ink-1) leading-snug line-clamp-2">{product.name}</span>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[14px] font-bold text-(--ink-0)">{formatMxn(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[11px] text-(--ink-3) line-through">{formatMxn(product.compareAtPrice)}</span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-(--ink-2) flex items-center gap-0.5 shrink-0">
            ★ {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
