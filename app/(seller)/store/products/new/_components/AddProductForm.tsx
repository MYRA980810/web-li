'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { createProduct } from '@/lib/productActions'
import type { Category } from '../page'

const CURRENCIES = ['MXN', 'USD', 'ARS', 'COP', 'PEN', 'CLP']

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',   active: false, href: '/home' },
  { icon: '🛍',  label: 'Store',  active: true,  href: '/store' },
  { icon: null,  label: 'Live',   active: false, isLive: true },
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

type Props = { categories: Category[] }

export function AddProductForm({ categories }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName]               = useState('')
  const [categoryId, setCategoryId]   = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]             = useState('')
  const [currency, setCurrency]       = useState('MXN')
  const [stock, setStock]             = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)

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
    fd.set('categoryId', categoryId)
    fd.set('description', description)
    fd.set('basePrice', price)
    fd.set('currency', currency)
    fd.set('stock', stock)
    const file = fileRef.current?.files?.[0]
    if (file) fd.set('image', file)

    const result = await createProduct(fd)

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/store/products/new/success')
  }

  const formContent = (idSuffix: string) => (
    <>
      {/* ── Información Básica ── */}
      <div className="product-section flex flex-col gap-4">
        <p className="product-section-title">Información Básica</p>

        <div>
          <label className="store-form-label" htmlFor={`name${idSuffix}`}>
            Nombre del Producto
          </label>
          <input
            id={`name${idSuffix}`}
            type="text"
            className="store-input"
            placeholder="Blazer Ejecutivo Premium"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="product-select-arrow">▾</span>
          </div>
        </div>

        <div>
          <label className="store-form-label" htmlFor={`desc${idSuffix}`}>
            Descripción
          </label>
          <textarea
            id={`desc${idSuffix}`}
            className="store-input"
            placeholder="Describe tu variante, materiales y ajuste..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ── Precios y Stock ── */}
      <div className="product-section flex flex-col gap-4">
        <p className="product-section-title">Precios y Stock</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="store-form-label" htmlFor={`price${idSuffix}`}>
              Precio Tienda
            </label>
            <input
              id={`price${idSuffix}`}
              type="number"
              min="0"
              step="0.01"
              className="store-input"
              placeholder="0.00"
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

        <div>
          <label className="store-form-label" htmlFor={`stock${idSuffix}`}>
            Stock
          </label>
          <input
            id={`stock${idSuffix}`}
            type="number"
            min="0"
            step="1"
            className="store-input"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      </div>

      {/* ── Multimedia ── */}
      <div className="product-section flex flex-col gap-4">
        <p className="product-section-title">Multimedia</p>

        <div
          className="product-media-zone"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Vista previa del producto"
                className="product-media-thumb"
              />
              <div className="product-media-badge">✏️</div>
            </>
          ) : (
            <div className="product-upload-hint">
              <span className="text-[40px] opacity-40">📷</span>
              <span className="text-[12px] text-(--ink-3) font-medium">
                Subir imagen del producto
              </span>
            </div>
          )}
        </div>
      </div>

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
        className="live-launch-btn w-full justify-center text-[14px]"
      >
        {isLoading ? 'Guardando...' : 'Guardar Producto'}
      </button>
    </>
  )

  return (
    <>
      <Ambient />

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <button
            className="store-back-btn"
            onClick={() => router.back()}
            aria-label="Volver"
          >
            ←
          </button>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase pointer-events-none">
            Añadir Producto
          </span>
          <button className="home-nav-icon" aria-label="Opciones">⚙️</button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-5 pt-5 pb-2 flex flex-col gap-4 reveal d1"
        >
          {formContent('')}
        </form>

        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="store-back-header px-12">
          <button
            className="flex items-center gap-2 text-[14px] font-semibold text-(--ink-2) hover:text-(--ink-0) transition-colors bg-none border-none cursor-pointer"
            onClick={() => router.back()}
          >
            ← Volver
          </button>
          <span className="font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase">
            Añadir Producto
          </span>
          <button className="home-nav-icon" aria-label="Opciones">⚙️</button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full max-w-md"
          >
            {formContent('-d')}
          </form>
        </div>
      </div>
    </>
  )
}
