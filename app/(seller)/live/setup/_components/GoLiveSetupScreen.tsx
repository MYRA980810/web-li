'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { defaultVariant } from '@/components/StockProductPicker'
import { hotProductDraftToFormData, type HotProductDraft } from '@/components/HotProductFields'
import { createLive, addCatalogLiveProduct, addHotLiveProduct, uploadLiveThumbnail } from '@/lib/liveActions'
import { StockPickerDrawer } from './StockPickerDrawer'
import { HotProductDrawer } from './HotProductDrawer'
import type { ProductView, Category } from '@/lib/types'

// Backend constraint: @Min(15) @Max(120)
const DEPLOY_STEPS = [
  { label: '15S', seconds: 15 },
  { label: '30S', seconds: 30 },
  { label: '60S', seconds: 60 },
  { label: '2M',  seconds: 120 },
]

function formatDeploy(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${seconds / 60}m`
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

function getPrimaryImage(product: ProductView): string | null {
  const primary = product.images.find((img) => img.primary)
  return primary?.url ?? product.images[0]?.url ?? null
}

type HotDraftEntry = { id: string; draft: HotProductDraft }

type Props = {
  storeId: string | null
  products: ProductView[]
  categories: Category[]
}

export function GoLiveSetupScreen({ storeId, products, categories }: Props) {
  const router = useRouter()

  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle]         = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [deployIdx, setDeployIdx] = useState(2)
  const [beautyAI, setBeautyAI]   = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const [stockDrawerOpen, setStockDrawerOpen]         = useState(false)
  const [selectedProductIds, setSelectedProductIds]   = useState<Set<string>>(new Set())

  const [hotDrawerOpen, setHotDrawerOpen] = useState(false)
  const [hotDrafts, setHotDrafts]         = useState<HotDraftEntry[]>([])

  const deploySeconds = DEPLOY_STEPS[deployIdx].seconds
  const fillPct       = (deployIdx / (DEPLOY_STEPS.length - 1)) * 100

  // Preserves selection order (Set iteration order) rather than catalog order.
  const selectedProducts = useMemo(
    () => [...selectedProductIds]
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is ProductView => !!p),
    [selectedProductIds, products],
  )

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addHotDraft(draft: HotProductDraft) {
    setHotDrafts((prev) => [...prev, { id: crypto.randomUUID(), draft }])
  }

  function removeHotDraft(id: string) {
    setHotDrafts((prev) => prev.filter((entry) => entry.id !== id))
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function handleRemoveThumbnail() {
    setThumbnailPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleStart() {
    setIsLoading(true)
    setError(null)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('La portada del live es requerida')
      setIsLoading(false)
      return
    }

    const upload = await uploadLiveThumbnail(file)
    if (!upload.ok) {
      setError(upload.error)
      setIsLoading(false)
      return
    }

    const result = await createLive({
      title:                  title.trim(),
      displayDurationSeconds: deploySeconds,
      context:                storeId ? 'STORE' : 'SELLER_PROFILE',
      storeId:                storeId ?? undefined,
      thumbnailUrl:           upload.url,
    })

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Attach the stock products picked in the drawer now that the live exists.
    // Best-effort: the live was created successfully, so we don't block going
    // live on individual product-attach failures — those can be retried from
    // the live's product picker afterwards.
    if (selectedProducts.length > 0) {
      await Promise.all(
        selectedProducts.map((p) => {
          const variant = defaultVariant(p)!
          return addCatalogLiveProduct(result.live.id, {
            productId:      p.id,
            variantId:      variant.id,
            nameSnapshot:   p.name,
            priceSnapshot:  variant.effectivePrice,
            currency:       p.currency,
            stockAllocated: variant.stock.availableQuantity,
            imageUrl:       getPrimaryImage(p),
          })
        }),
      )
    }

    // Same best-effort treatment for hot-drafted products created via
    // "Añadir Nuevo" — the drafts were only collected locally until now.
    if (hotDrafts.length > 0) {
      await Promise.all(
        hotDrafts.map((entry) => addHotLiveProduct(result.live.id, hotProductDraftToFormData(entry.draft))),
      )
    }

    router.push(`/live/setup/countdown?liveId=${result.live.id}`)
  }

  const formBody = (idSuffix: string) => (
    <>
      {/* Eyebrow + heading */}
      <div className="px-5 mt-6 reveal d1">
        <span className="eyebrow">Sesión Instantánea</span>
        <h1 className="live-setup-h1">Configuración<br />de Live</h1>
      </div>

      {/* Session title */}
      <div className="px-5 mt-7 reveal d2">
        <label className="store-form-label" htmlFor={`session-title${idSuffix}`}>
          Título de la Sesión
        </label>
        <input
          id={`session-title${idSuffix}`}
          type="text"
          className="store-input"
          placeholder="Ej. Liquidación de verano · Ropa Premium"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Portada del Live */}
      <div className="px-5 mt-7 reveal d3">
        <label className="store-form-label">Portada del Live</label>
        {thumbnailPreview ? (
          <div className="img-picker-thumb-wrap">
            <Image
              src={thumbnailPreview}
              alt="Portada del live"
              width={96}
              height={96}
              className="img-picker-thumb"
              unoptimized={thumbnailPreview.startsWith('blob:')}
            />
            <button
              type="button"
              className="img-picker-remove-btn"
              onClick={handleRemoveThumbnail}
              disabled={isLoading}
              aria-label="Eliminar imagen"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="img-picker-empty-zone"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
          >
            <span className="text-[40px] opacity-40">📷</span>
            <span className="text-[12px] text-(--ink-3) font-medium">Subir Portada</span>
            <span className="text-[10px] text-(--ink-4) mt-1">JPG, PNG o WebP · Máx. 5 MB</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbnailChange}
        />
      </div>

      {/* Deploy time slider */}
      <div className="px-5 mt-7 reveal d4">
        <div className="flex items-center justify-between mb-4">
          <span className="store-form-label" style={{ marginBottom: 0 }}>
            Tiempo de Despliegue
          </span>
          <span className="live-setup-time-value">{formatDeploy(deploySeconds)}</span>
        </div>
        <div className="live-slider-wrap">
          <input
            type="range"
            className="live-slider"
            min={0}
            max={3}
            step={1}
            value={deployIdx}
            style={{ '--live-fill': `${fillPct}%` } as React.CSSProperties}
            onChange={(e) => setDeployIdx(Number(e.target.value))}
            aria-label="Tiempo de despliegue"
            disabled={isLoading}
          />
          <div className="live-slider-ticks">
            {DEPLOY_STEPS.map((s) => (
              <span key={s.label} className="live-slider-tick">{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Product inventory */}
      <div className="px-5 mt-7 reveal d5">
        <span className="store-form-label">Inventario de Productos</span>
        <div className="live-inventory-grid">
          <button
            type="button"
            className={`live-inventory-card${selectedProductIds.size > 0 ? ' selected' : ''}`}
            aria-label="Cargar desde stock"
            onClick={() => setStockDrawerOpen(true)}
            disabled={isLoading}
          >
            <span className="live-inventory-card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="5" rx="1"/>
                <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/>
                <path d="M9 13h6M9 16h4"/>
              </svg>
            </span>
            <span className="live-inventory-card-body">
              <span className="live-inventory-card-title">Cargar desde Stock</span>
              <span className="live-inventory-card-desc">
                {selectedProductIds.size > 0
                  ? `${selectedProductIds.size} producto${selectedProductIds.size === 1 ? '' : 's'} seleccionado${selectedProductIds.size === 1 ? '' : 's'}`
                  : 'Selecciona productos existentes de tu tienda'}
              </span>
            </span>
          </button>
          <button
            type="button"
            className={`live-inventory-card${hotDrafts.length > 0 ? ' selected' : ''}`}
            aria-label="Añadir nuevo"
            onClick={() => setHotDrawerOpen(true)}
            disabled={isLoading}
          >
            <span className="live-inventory-card-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </span>
            <span className="live-inventory-card-body">
              <span className="live-inventory-card-title">Añadir Nuevo</span>
              <span className="live-inventory-card-desc">
                {hotDrafts.length > 0
                  ? `${hotDrafts.length} producto${hotDrafts.length === 1 ? '' : 's'} nuevo${hotDrafts.length === 1 ? '' : 's'}`
                  : 'Carga productos manualmente si no tenés una tienda configurada'}
              </span>
            </span>
          </button>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex flex-col mt-2">
            {selectedProducts.map((p) => {
              const variant  = defaultVariant(p)
              const price    = variant?.effectivePrice ?? p.basePrice
              const imageUrl = getPrimaryImage(p)
              const isLow    = p.stock.totalQuantity > 0 && p.stock.totalQuantity <= 3

              return (
                <div key={p.id} className="stock-product-item">
                  <div
                    className="stock-product-thumb"
                    style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,31,135,0.12), rgba(8,5,20,0.9))' }}
                  >
                    {imageUrl ? (
                      <Image src={imageUrl} alt={p.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[24px] opacity-50">📦</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-(--ink-0) leading-snug truncate">{p.name}</p>
                    <p className="text-[13px] font-bold text-brand-400">{formatPrice(price)}</p>
                    <div className={`flex items-center gap-1.5 mt-0.5 ${isLow ? 'stock-low-warning' : 'text-(--ink-3)'}`}>
                      {isLow ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            <path d="M6 4.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
                          </svg>
                          <span className="text-[12px] font-medium">{p.stock.totalQuantity} unidades (Stock bajo)</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M4 5h4M4 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          <span className="text-[12px] font-medium">{p.stock.totalQuantity} unidades en stock</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="live-selected-product-remove"
                    onClick={() => toggleProduct(p.id)}
                    aria-label={`Quitar ${p.name}`}
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {hotDrafts.length > 0 && (
          <div className="flex flex-col mt-2">
            {hotDrafts.map(({ id, draft }) => (
              <div key={id} className="stock-product-item">
                <div
                  className="stock-product-thumb"
                  style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.16), rgba(8,5,20,0.9))' }}
                >
                  <span className="text-[22px] opacity-60">🆕</span>
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-(--ink-0) leading-snug truncate">{draft.name}</p>
                  <p className="text-[13px] font-bold text-brand-400">{formatPrice(parseFloat(draft.price || '0'))}</p>
                  <p className="text-[12px] font-medium text-(--ink-3)">{draft.stock || '0'} unidades · Nuevo</p>
                </div>
                <button
                  type="button"
                  className="live-selected-product-remove"
                  onClick={() => removeHotDraft(id)}
                  aria-label={`Quitar ${draft.name}`}
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beauty AI toggle */}
      <div className="px-5 mt-5 reveal d6">
        <div className="live-toggle-row">
          <div className="flex items-center gap-3">
            <span className="live-toggle-icon">✨</span>
            <span className="live-toggle-label">Filtros de Belleza IA</span>
          </div>
          <button
            className={`live-toggle${beautyAI ? ' on' : ''}`}
            onClick={() => setBeautyAI((v) => !v)}
            role="switch"
            aria-checked={beautyAI}
            aria-label="Filtros de Belleza IA"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="px-5 mt-4">
          <p className="text-[13px] text-red-400 font-medium leading-snug">{error}</p>
        </div>
      )}

      <div className="h-36" />
    </>
  )

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
            Configuración de Live
          </span>
          <button className="home-nav-icon" aria-label="Configuración">⚙️</button>
        </div>

        {formBody('-m')}

        <div className="live-setup-cta lg:hidden">
          <button
            className="live-start-btn"
            onClick={handleStart}
            disabled={!title.trim() || !thumbnailPreview || isLoading}
          >
            {isLoading ? 'Creando sesión...' : '🚀 Iniciar Live Ahora'}
          </button>
        </div>

        <SellerBottomNav active="home" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:block stage screen-enter">
        <div className="max-w-lg mx-auto w-full">

          <div className="live-setup-nav">
            <button className="store-back-btn" onClick={() => router.back()} aria-label="Volver">
              ←
            </button>
            <span className="live-setup-nav-title">Go Live Setup</span>
            <button className="store-back-btn" aria-label="Configuración">⚙️</button>
          </div>

          {formBody('-d')}

          <div className="px-5 mt-6 pb-10">
            <button
              className="live-start-btn"
              onClick={handleStart}
              disabled={!title.trim() || !thumbnailPreview || isLoading}
            >
              {isLoading ? 'Creando sesión...' : '🚀 Iniciar Live Ahora'}
            </button>
          </div>
        </div>

        <SellerBottomNav active="home" />
      </div>

      <StockPickerDrawer
        open={stockDrawerOpen}
        onClose={() => setStockDrawerOpen(false)}
        products={products}
        categories={categories}
        selected={selectedProductIds}
        onToggle={toggleProduct}
      />

      <HotProductDrawer
        open={hotDrawerOpen}
        onClose={() => setHotDrawerOpen(false)}
        onAdd={addHotDraft}
      />
    </>
  )
}
