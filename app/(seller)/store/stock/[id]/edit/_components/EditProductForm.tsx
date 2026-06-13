'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { updateProduct } from '@/lib/productActions'
import type { ProductView, Category } from '@/lib/types'

const CURRENCIES = ['MXN', 'USD', 'ARS', 'COP', 'PEN', 'CLP']

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

type Props = {
  product: ProductView | null
  categories: Category[]
}

function NotFound() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">📦</span>
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold text-(--ink-0)">Producto no encontrado</p>
        <p className="text-[14px] text-(--ink-3)">No se puede editar un producto que no existe.</p>
      </div>
      <button onClick={() => router.back()} className="live-launch-btn text-[14px]">
        Volver
      </button>
    </div>
  )
}

function getPrimaryImage(product: ProductView): string | null {
  const primary = product.images.find((img) => img.primary)
  return primary?.url ?? product.images[0]?.url ?? null
}

function EditForm({ product, categories }: { product: ProductView; categories: Category[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const defaultVariant = product.variants.find((v) => v.isDefault)

  const [name, setName]                   = useState(product.name)
  const [categoryId, setCategoryId]       = useState(product.categoryId ?? '')
  const [description, setDescription]     = useState(product.description ?? '')
  const [price, setPrice]                 = useState(String(product.basePrice))
  const [currency, setCurrency]           = useState(product.currency)
  const [additionalStock, setAdditionalStock] = useState('')
  // active toggle — can only deactivate (no reactivate endpoint in backend yet)
  const [wantsDeactivate, setWantsDeactivate] = useState(false)
  const [imagePreview, setImagePreview]   = useState<string | null>(null)
  const existingImage = getPrimaryImage(product)
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set('name', name)
    if (categoryId) fd.set('categoryId', categoryId)
    fd.set('description', description)
    fd.set('basePrice', price)
    fd.set('currency', currency)
    fd.set('additionalStock', additionalStock || '0')
    fd.set('wantsDeactivate', String(wantsDeactivate))
    const file = fileRef.current?.files?.[0]
    if (file) fd.set('image', file)

    const variantId = defaultVariant?.id ?? ''
    const result = await updateProduct(product.id, variantId, fd)

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.replace(`/store/stock/${product.id}/edit/success`)
  }

  const formContent = (idSuffix: string) => (
    <>
      {/* ── Imagen ── */}
      <div
        className="product-media-hero-zone"
        onClick={() => fileRef.current?.click()}
      >
        {imagePreview ? (
          <>
            <Image
              src={imagePreview}
              alt="Vista previa"
              width={480}
              height={220}
              className="product-media-hero-img"
            />
            <div className="product-media-hero-overlay">
              <span className="text-[24px]">📷</span>
              <span className="product-media-hero-label">Cambiar Imagen</span>
            </div>
          </>
        ) : existingImage ? (
          <>
            <Image
              src={existingImage}
              alt={product.name}
              width={480}
              height={220}
              className="product-media-hero-img"
            />
            <div className="product-media-hero-overlay">
              <span className="text-[24px]">📷</span>
              <span className="product-media-hero-label">Cambiar Imagen</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <span className="text-[48px] opacity-40">📷</span>
            <span className="text-[11px] font-bold tracking-[0.10em] text-(--ink-3) uppercase">
              Subir Imagen
            </span>
          </div>
        )}
      </div>

      {/* ── Nombre ── */}
      <div>
        <label className="store-form-label" htmlFor={`name${idSuffix}`}>
          Nombre del Producto
        </label>
        <input
          id={`name${idSuffix}`}
          type="text"
          className="store-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* ── Descripción ── */}
      <div>
        <label className="store-form-label" htmlFor={`desc${idSuffix}`}>
          Descripción
        </label>
        <textarea
          id={`desc${idSuffix}`}
          className="store-input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* ── Precio + Moneda ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="store-form-label" htmlFor={`price${idSuffix}`}>
            Precio Base
          </label>
          <input
            id={`price${idSuffix}`}
            type="number"
            min="0.01"
            step="0.01"
            className="store-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="store-form-label" htmlFor={`currency${idSuffix}`}>
            Moneda
          </label>
          <div className="product-select-wrap">
            <select
              id={`currency${idSuffix}`}
              className="product-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="product-select-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* ── Categoría ── */}
      <div>
        <label className="store-form-label" htmlFor={`category${idSuffix}`}>
          Categoría
        </label>
        <div className="product-select-wrap">
          <select
            id={`category${idSuffix}`}
            className="product-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="product-select-arrow">▾</span>
        </div>
      </div>

      {/* ── Stock actual + Agregar stock ── */}
      <div className="product-detail-section flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-[0.10em] text-(--ink-3) uppercase">Stock</p>
          <span className="text-[13px] font-semibold text-(--ink-0)">
            {product.stock.totalQuantity} unidades actuales
          </span>
        </div>
        <div>
          <label className="store-form-label" htmlFor={`stock${idSuffix}`}>
            Agregar al Stock
          </label>
          <input
            id={`stock${idSuffix}`}
            type="number"
            min="1"
            step="1"
            className="store-input"
            placeholder="Ej: 10 — se suma al stock actual"
            value={additionalStock}
            onChange={(e) => setAdditionalStock(e.target.value)}
          />
        </div>
      </div>

      {/* ── Estado — solo deactivate (no existe endpoint de reactivate para productos) ── */}
      {product.active && (
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-[var(--r-lg)]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex flex-col gap-0.5">
            <label className="store-form-label mb-0 cursor-pointer" htmlFor={`deactivate${idSuffix}`}>
              Estado del Producto
            </label>
            <span className="text-[12px] text-(--ink-3)">
              {wantsDeactivate ? 'Se desactivará al guardar' : 'Activo — visible en tu tienda'}
            </span>
          </div>
          <button
            id={`deactivate${idSuffix}`}
            type="button"
            role="switch"
            aria-checked={!wantsDeactivate}
            onClick={() => setWantsDeactivate((v) => !v)}
            className={`toggle-switch${wantsDeactivate ? '' : ' on'}`}
          />
        </div>
      )}

      {!product.active && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] text-[13px]"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <span>⚠</span>
          <span className="text-(--ink-2)">
            Este producto está inactivo. La reactivación debe hacerse desde el panel de administración.
          </span>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[var(--r-lg)] text-[13px] text-(--ink-1) leading-relaxed"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)' }}
          role="alert"
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="live-launch-btn w-full justify-center text-[14px] tracking-[0.04em]"
      >
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="btn-ghost w-full justify-center text-[13px] tracking-[0.06em] uppercase"
      >
        Cancelar
      </button>
    </>
  )

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden">
        <form onSubmit={handleSubmit} className="px-5 pt-5 pb-2 flex flex-col gap-4 reveal d1">
          {formContent('')}
        </form>
        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex items-start justify-center py-10 px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          {formContent('-d')}
        </form>
      </div>
    </>
  )
}

export function EditProductForm({ product, categories }: Props) {
  const router = useRouter()

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <button className="store-back-btn" onClick={() => router.back()} aria-label="Volver">
            ←
          </button>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            Editar Producto
          </span>
          <div className="w-8" />
        </div>
        {product ? <EditForm product={product} categories={categories} /> : <NotFound />}
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <button
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors bg-none border-none cursor-pointer"
            onClick={() => router.back()}
          >
            ← Volver
          </button>
          <span className="font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase">
            Editar Producto
          </span>
          <div className="w-20" />
        </div>
        {product ? <EditForm product={product} categories={categories} /> : <NotFound />}
      </div>
    </>
  )
}
