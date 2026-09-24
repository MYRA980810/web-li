'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { formatMxn } from '@/lib/format'
import { fallbackGradient, storeInitials } from '@/lib/visualFallbacks'
import { resolveVariant } from '@/lib/buyerViewMappers'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import type { BuyerProductDetailView, BuyerStoreView } from '@/lib/types'

const REJECTION_LABELS: Record<string, string> = {
  UNAVAILABLE: 'Este producto ya no está disponible',
  LIVE_EXCLUSIVE: 'Solo disponible durante el live',
  QUANTITY_LIMIT_EXCEEDED: 'Alcanzaste el máximo por producto',
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <span className="text-[13px] text-[#fbbf6b] tracking-tight" aria-label={`${rating} de 5 estrellas`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
    </span>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">📦</span>
      <p className="text-[18px] font-semibold text-(--ink-0)">Producto no encontrado</p>
      <Link href="/buyer/buscar" className="live-launch-btn text-[14px]">Volver a Tiendas</Link>
    </div>
  )
}

type Props = { product: BuyerProductDetailView | null; store: BuyerStoreView | null }

export function ProductDetailBuyerScreen({ product, store }: Props) {
  const router = useRouter()
  const cart = useCart()
  const [favorite, setFavorite] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [colorId, setColorId] = useState(product?.defaultColorId ?? null)
  const [sizeId, setSizeId] = useState(product?.defaultSizeId ?? null)
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const selectedSize = useMemo(() => product?.sizes.find((s) => s.id === sizeId) ?? null, [product, sizeId])
  const resolvedVariant = useMemo(
    () => (product ? resolveVariant(product, colorId, sizeId) : null),
    [product, colorId, sizeId],
  )

  if (!product) {
    return (
      <>
        <Ambient />
        <div className="stage screen-enter">
          <NotFound />
        </div>
      </>
    )
  }

  const unitPrice = resolvedVariant?.effectivePrice ?? product.basePrice
  const availableQuantity = resolvedVariant?.stock.availableQuantity ?? product.baseAvailableQuantity
  const totalPrice = unitPrice * quantity
  const canAddToCart = !product.exclusiveToActiveLive && availableQuantity > 0 && !submitting

  async function addToCart(): Promise<boolean> {
    if (!product) return false
    setSubmitting(true)
    setAddError(null)
    const result = await cart.addItem(product.storeId, product.id, resolvedVariant?.id ?? null, quantity)
    setSubmitting(false)

    if (!result.ok) {
      setAddError(result.error)
      return false
    }
    if (!result.result.success) {
      setAddError(
        (result.result.rejectionReason && REJECTION_LABELS[result.result.rejectionReason]) ??
          'No se pudo agregar al carrito',
      )
      return false
    }
    return true
  }

  async function handleAddToCart() {
    if (!canAddToCart) return
    const ok = await addToCart()
    if (ok) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  async function handleBuyNow() {
    if (!canAddToCart) return
    const ok = await addToCart()
    if (ok) router.push('/buyer/cart')
  }

  const liveNowBanner = product.isLiveNow && (
    <span className="buyer-live-now-banner w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]" />
      Se muestra en el live ahora
    </span>
  )

  const footerStepper = (
    <div className="buyer-qty-stepper">
      <button className="buyer-qty-btn" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)} aria-label="Restar">−</button>
      <span className="text-[13px] font-bold text-(--ink-0) w-4 text-center">{quantity}</span>
      <button className="buyer-qty-btn" disabled={quantity >= availableQuantity} onClick={() => setQuantity((q) => q + 1)} aria-label="Sumar">+</button>
    </div>
  )

  const favoriteLabel = favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'

  const mobileHero = (
    <div
      className="product-hero-full"
      style={product.images.length === 0 ? { background: fallbackGradient(product.id) } : undefined}
    >
      {product.images.length > 0 && (
        <Image
          src={product.images[activeImage] ?? product.images[0]!}
          alt={product.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-5">
        <button onClick={() => router.back()} className="product-hero-overlay-btn" aria-label="Volver">←</button>
        <div className="flex items-center gap-2.5">
          <button className="product-hero-overlay-btn" aria-label="Expandir">↗</button>
          <button
            className={`product-hero-overlay-btn${favorite ? ' text-brand-400' : ''}`}
            onClick={() => setFavorite((prev) => !prev)}
            aria-label={favoriteLabel}
          >
            {favorite ? '♥' : '♡'}
          </button>
        </div>
      </div>

      <div className="absolute left-5 top-[76px] z-10 flex flex-col gap-2.5">
        {liveNowBanner}
        {product.images.length > 1 && (
          <div className="flex flex-col gap-2">
            {product.images.map((img, idx) => (
              <button
                key={img}
                className={`product-hero-thumb${activeImage === idx ? ' active' : ''}`}
                onClick={() => setActiveImage(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <Image src={img} alt="" fill sizes="46px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {product.images.length > 0 && (
        <span className="product-hero-counter absolute bottom-4 right-5 z-10">
          {activeImage + 1}/{product.images.length}
        </span>
      )}
    </div>
  )

  const desktopHero = (
      <div className="flex gap-3">
        {product.images.length > 1 && (
          <div className="buyer-thumb-rail">
            {product.images.map((img, idx) => (
              <button
                key={img}
                className={`buyer-thumb-item${activeImage === idx ? ' active' : ''}`}
                onClick={() => setActiveImage(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <Image src={img} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div
          className="product-detail-hero flex-1 relative"
          style={product.images.length === 0 ? { background: fallbackGradient(product.id), minHeight: 320 } : { minHeight: 320 }}
        >
          {product.images.length > 0 && (
            <Image
              src={product.images[activeImage] ?? product.images[0]!}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          )}
          {product.images.length > 0 && (
            <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-white/85 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {activeImage + 1}/{product.images.length}
            </span>
          )}
        </div>
      </div>
  )

  const details = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="eyebrow text-[10px]">{(product.category ?? 'Producto').toUpperCase()}</span>
          {product.sku && <span className="text-[11px] text-(--ink-3)">SKU {product.sku}</span>}
        </div>
        <h1 className="font-display font-bold text-[19px] text-(--ink-0) leading-snug">{product.name}</h1>
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-[13px] font-semibold text-(--ink-0)">{product.rating.toFixed(1)}</span>
          <span className="text-[12px] text-(--ink-3)">
            {product.reviewCount} reseñas · {product.soldCount} vendidos
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-display font-extrabold text-[26px] text-(--ink-0)">{formatMxn(unitPrice)}</span>
          {product.compareAtPrice && (
            <span className="text-[14px] text-(--ink-3) line-through">{formatMxn(product.compareAtPrice)}</span>
          )}
          {product.discountLabel && <span className="buyer-discount-badge">{product.discountLabel}</span>}
        </div>
      </div>

      {product.colors.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-(--ink-0)">Color</span>
            <span className="text-[12px] text-(--ink-3)">{product.colors.find((c) => c.id === colorId)?.label}</span>
          </div>
          <div className="flex gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.id}
                className={`buyer-color-swatch${colorId === c.id ? ' selected' : ''}`}
                style={{ background: c.swatch ?? fallbackGradient(c.id) }}
                onClick={() => setColorId(c.id)}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-(--ink-0)">Talla</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s.id}
                disabled={!s.available}
                className={`buyer-size-chip${sizeId === s.id ? ' selected' : ''}${!s.available ? ' disabled' : ''}`}
                onClick={() => s.available && setSizeId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {selectedSize?.available && (
            <span className="text-[12px] text-(--ink-3)">Disponible en talla {selectedSize.label}</span>
          )}
        </div>
      )}

      {product.exclusiveToActiveLive && (
        <p className="text-[12px] text-(--ink-3)">Este producto solo se puede comprar durante el live.</p>
      )}
      {addError && <p className="text-[12px] text-red-400">{addError}</p>}

      {store && (
        <div
          className="buyer-store-card"
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/buyer/stores/${store.id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') router.push(`/buyer/stores/${store.id}`)
          }}
        >
          {store.logoUrl ? (
            <div className="buyer-store-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
              <Image src={store.logoUrl} alt={store.name} fill sizes="44px" className="object-cover" />
            </div>
          ) : (
            <div className="buyer-store-avatar" style={{ width: 44, height: 44, fontSize: 15, background: fallbackGradient(store.id) }}>
              {storeInitials(store.name)}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-[14px] font-bold text-(--ink-0) truncate">{store.name}</span>
            {(store.reviewCount > 0 || store.followerCount > 0) && (
              <span className="text-[11px] text-(--ink-3) truncate">
                {store.reviewCount > 0 && <>★ {store.rating.toFixed(1)}</>}
                {store.reviewCount > 0 && store.followerCount > 0 && ' · '}
                {store.followerCount > 0 && <>{store.followerCount.toLocaleString('es-MX')} seguidores</>}
              </span>
            )}
          </div>
          <span className="buyer-store-pill-btn shrink-0">Ver tienda</span>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        {mobileHero}

        <div className="px-5 pt-5 pb-4 reveal d1">{details}</div>

        <div className="buyer-floating-bar-wrap">
          <div className="buyer-floating-bar">
            {footerStepper}
            <button className="buyer-cart-square-btn" aria-label="Agregar al carrito" disabled={!canAddToCart} onClick={handleAddToCart}>
              {added ? '✓' : '🛒'}
            </button>
            <button className="live-launch-btn flex-1 justify-center" disabled={!canAddToCart} onClick={handleBuyNow}>
              Comprar · {formatMxn(totalPrice)}
            </button>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="buyer-store-top-bar !px-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">← Volver</button>
          <button
            className={`buyer-icon-btn${favorite ? ' text-brand-400' : ''}`}
            onClick={() => setFavorite((prev) => !prev)}
            aria-label={favoriteLabel}
          >
            {favorite ? '♥' : '♡'}
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {liveNowBanner}
            {desktopHero}
            {details}
          </div>
        </div>

        <div className="buyer-sticky-footer !justify-center gap-4">
          {footerStepper}
          <button className="buyer-icon-btn" aria-label="Agregar al carrito" disabled={!canAddToCart} onClick={handleAddToCart}>
            {added ? '✓' : '🛒'}
          </button>
          <button className="live-launch-btn" disabled={!canAddToCart} onClick={handleBuyNow}>
            Comprar · {formatMxn(totalPrice)}
          </button>
        </div>
      </div>
    </>
  )
}
