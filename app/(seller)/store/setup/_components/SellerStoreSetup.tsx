'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { uploadStoreLogo, createStore } from '@/lib/storeActions'
import { createStoreSchema } from '@/lib/schemas'

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

export function SellerStoreSetup() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [storeName, setStoreName]     = useState('')
  const [slug, setSlug]               = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl]         = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoPreview(URL.createObjectURL(file))
    setLogoLoading(true)
    setErrors((prev) => ({ ...prev, logo: '' }))

    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadStoreLogo(fd)

    setLogoLoading(false)

    if (result.ok) {
      setLogoUrl(result.url)
    } else {
      setErrors((prev) => ({ ...prev, logo: result.error }))
      setLogoPreview(null)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const validated = createStoreSchema.safeParse({
      name:        storeName,
      slug,
      description: description || undefined,
      logoUrl:     logoUrl || undefined,
    })

    if (!validated.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validated.error.issues) {
        const key = String(issue.path[0] ?? '_form')
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    const result = await createStore(validated.data)
    setLoading(false)

    if (!result.ok) {
      setErrors({ _form: result.error })
      return
    }

    router.push(`/store/setup/success?name=${encodeURIComponent(storeName)}`)
  }

  return (
    <>
      <Ambient />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleLogoChange}
      />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <button className="store-back-btn" onClick={() => router.back()} aria-label="Volver">
            ←
          </button>
          <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em] pointer-events-none">
            Configurar Tienda
          </span>
          <button className="home-nav-icon" aria-label="Configuración">⚙️</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pt-6 pb-2 flex flex-col gap-6 reveal d1">
          <div className="flex flex-col items-center gap-2">
            <div
              className="store-logo-wrap cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo de la tienda"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-[36px]">🏪</span>
              )}
              <div className="store-logo-badge">{logoLoading ? '⏳' : '✏️'}</div>
            </div>
            <span className="store-form-label">Logo de la Tienda</span>
            {errors.logo && (
              <p className="text-[12px] text-brand-400">{errors.logo}</p>
            )}
          </div>

          <div>
            <label className="store-form-label" htmlFor="store-name">
              Nombre de la Tienda
            </label>
            <input
              id="store-name"
              type="text"
              className="store-input"
              placeholder="Ej: Neon Atrium Boutique"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            {errors.name && (
              <p className="text-[12px] text-brand-400 mt-1.5">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="store-form-label" htmlFor="store-slug">
              SKU de la Tienda
            </label>
            <div className="store-input-wrap">
              <span className="store-input-prefix">@</span>
              <input
                id="store-slug"
                type="text"
                className="store-input store-input-prefixed"
                placeholder="neon-atrium-live"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            {errors.slug && (
              <p className="text-[12px] text-brand-400 mt-1.5">{errors.slug}</p>
            )}
          </div>

          <div>
            <label className="store-form-label" htmlFor="store-desc">
              Descripción de la Tienda
            </label>
            <textarea
              id="store-desc"
              className="store-input"
              placeholder="Cuéntanos un poco sobre tu marca..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-[12px] text-brand-400 mt-1.5">{errors.description}</p>
            )}
          </div>

          <div className="store-info-tip">
            <span className="text-[15px] text-cyan-400 shrink-0 mt-0.5">ℹ</span>
            <p className="text-[12px] text-(--ink-2) leading-relaxed">
              Tu identificador SKU será visible en los enlaces compartidos y durante tus
              transmisiones en vivo. Solo minúsculas, números y guiones.
            </p>
          </div>

          {errors._form && (
            <div
              className="store-info-tip"
              style={{ borderColor: 'rgba(255,31,135,0.3)', background: 'rgba(255,31,135,0.05)' }}
            >
              <span className="text-[15px] text-brand-400 shrink-0 mt-0.5">⚠</span>
              <p className="text-[12px] text-brand-400 leading-relaxed">{errors._form}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || logoLoading}
            className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar y Continuar'}
          </button>
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
          <span className="font-display font-bold text-[16px] text-(--ink-0) tracking-[-0.02em]">
            Configurar Tienda
          </span>
          <button className="home-nav-icon" aria-label="Configuración">⚙️</button>
        </div>

        <div className="flex items-start justify-center py-12 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md">
            <div className="flex flex-col items-center gap-2">
              <div
                className="store-logo-wrap cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo de la tienda"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-[36px]">🏪</span>
                )}
                <div className="store-logo-badge">{logoLoading ? '⏳' : '✏️'}</div>
              </div>
              <span className="store-form-label">Logo de la Tienda</span>
              {errors.logo && (
                <p className="text-[12px] text-brand-400">{errors.logo}</p>
              )}
            </div>

            <div>
              <label className="store-form-label" htmlFor="store-name-d">
                Nombre de la Tienda
              </label>
              <input
                id="store-name-d"
                type="text"
                className="store-input"
                placeholder="Ej: Neon Atrium Boutique"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              {errors.name && (
                <p className="text-[12px] text-brand-400 mt-1.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="store-form-label" htmlFor="store-slug-d">
                SKU de la Tienda
              </label>
              <div className="store-input-wrap">
                <span className="store-input-prefix">@</span>
                <input
                  id="store-slug-d"
                  type="text"
                  className="store-input store-input-prefixed"
                  placeholder="neon-atrium-live"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              {errors.slug && (
                <p className="text-[12px] text-brand-400 mt-1.5">{errors.slug}</p>
              )}
            </div>

            <div>
              <label className="store-form-label" htmlFor="store-desc-d">
                Descripción de la Tienda
              </label>
              <textarea
                id="store-desc-d"
                className="store-input"
                placeholder="Cuéntanos un poco sobre tu marca..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-[12px] text-brand-400 mt-1.5">{errors.description}</p>
              )}
            </div>

            <div className="store-info-tip">
              <span className="text-[15px] text-cyan-400 shrink-0 mt-0.5">ℹ</span>
              <p className="text-[12px] text-(--ink-2) leading-relaxed">
                Tu identificador SKU será visible en los enlaces compartidos y durante tus
                transmisiones en vivo. Solo minúsculas, números y guiones.
              </p>
            </div>

            {errors._form && (
              <div
                className="store-info-tip"
                style={{ borderColor: 'rgba(255,31,135,0.3)', background: 'rgba(255,31,135,0.05)' }}
              >
                <span className="text-[15px] text-brand-400 shrink-0 mt-0.5">⚠</span>
                <p className="text-[12px] text-brand-400 leading-relaxed">{errors._form}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || logoLoading}
              className="live-launch-btn justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
