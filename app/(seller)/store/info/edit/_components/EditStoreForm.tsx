'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { updateStore, uploadStoreLogo, setStoreActive } from '@/lib/storeActions'
import type { StoreResponse } from '@/lib/storeActions'

const StoreFieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M2 6.5h14M3 3h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M6 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const DescriptionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const FingerprintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M6.5 15.5c-.4-1.8-.5-3.6-.2-5.4M9 16c0-2.8.2-5.5 1-7.5M11.5 15c.6-1.8.8-3.8.6-5.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M3 10.5A6 6 0 0 1 9 4.5a6 6 0 0 1 6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M5 11a4 4 0 0 1 4-3.5 4 4 0 0 1 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const LightningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke="var(--brand-400)" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M9.5 2.5L11.5 4.5M1.5 12.5l.9-3.6L10 1.4a1.41 1.41 0 0 1 2 2L4.1 11.6l-3.6.9z"
      stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="5" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="4" y="9" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

type Props = { store: StoreResponse }

export function EditStoreForm({ store }: Props) {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const initialActive = store.active && !store.suspended

  const [name, setName]               = useState(store.name)
  const [description, setDescription] = useState(store.description ?? '')
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logoUrl)
  const [active, setActive]           = useState(initialActive)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    let logoUrl = store.logoUrl ?? undefined

    const file = fileRef.current?.files?.[0]
    if (file) {
      const fd = new FormData()
      fd.set('file', file)
      const upload = await uploadStoreLogo(fd)
      if (!upload.ok) {
        setError(upload.error)
        setIsLoading(false)
        return
      }
      logoUrl = upload.url
    }

    const result = await updateStore({ name, description: description || undefined, logoUrl })
    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    if (active !== initialActive) {
      const toggle = await setStoreActive(active)
      if (!toggle.ok) {
        setError(toggle.error ?? 'Error al cambiar el estado de la tienda')
        setIsLoading(false)
        return
      }
    }

    router.push('/store')
  }

  const slugDisplay = `#${store.slug.slice(0, 12).toUpperCase()}`

  const formContent = (idSuffix: string) => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Avatar ───────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="store-edit-avatar-wrap">
          <div className="store-info-avatar">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt={name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized={logoPreview.startsWith('blob:')}
              />
            ) : (
              <span className="text-[40px]">🛍</span>
            )}
          </div>
          <button
            type="button"
            className="store-edit-avatar-btn"
            onClick={() => fileRef.current?.click()}
            aria-label="Cambiar foto de perfil"
          >
            <PencilIcon />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-display font-bold text-[20px] text-(--ink-0) leading-tight">
            {name || store.name}
          </p>
          <p className="text-[13px] text-(--ink-3)">Vendedor Verificado</p>
        </div>
      </div>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-red-500/10 border border-red-500/25 text-red-400 text-[13px]">
          {error}
        </div>
      )}

      {/* ── Nombre de la Tienda ──────────────────── */}
      <div className="flex flex-col">
        <label className="store-edit-label" htmlFor={`name-${idSuffix}`}>
          Nombre de la Tienda
        </label>
        <div className="store-edit-input-wrap">
          <span className="store-edit-input-icon">
            <StoreFieldIcon />
          </span>
          <input
            id={`name-${idSuffix}`}
            type="text"
            className="store-input store-edit-icon-input"
            placeholder="Nombre de tu tienda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      {/* ── Descripción ──────────────────────────── */}
      <div className="flex flex-col">
        <label className="store-edit-label" htmlFor={`desc-${idSuffix}`}>
          Descripción
        </label>
        <div className="store-edit-input-wrap">
          <span className="store-edit-textarea-icon">
            <DescriptionIcon />
          </span>
          <textarea
            id={`desc-${idSuffix}`}
            className="store-input store-edit-icon-input"
            rows={4}
            placeholder="Describe tu tienda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ── ID de Tienda / SKU (readonly) ─────────── */}
      <div className="flex flex-col store-edit-disabled">
        <span className="store-edit-label">ID de Tienda / SKU</span>
        <div className="store-edit-input-wrap">
          <span className="store-edit-input-icon">
            <FingerprintIcon />
          </span>
          <input
            type="text"
            className="store-input store-edit-icon-input"
            value={slugDisplay}
            disabled
            readOnly
          />
        </div>
        <p className="store-edit-note">
          * El ID de tienda no puede ser modificado después de la creación.
        </p>
      </div>

      {/* ── Divider ──────────────────────────────── */}
      <div className="store-edit-divider" />

      {/* ── Toggle Tienda Activa ──────────────────── */}
      <div className="store-edit-toggle-row">
        <div className="store-edit-toggle-icon">
          <LightningIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="store-edit-toggle-title">Tienda Activa</p>
          <p className="store-edit-toggle-sub">Visible para todos los usuarios</p>
        </div>
        <label className="store-edit-switch" aria-label="Activar o desactivar tienda">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="store-edit-switch-track" />
        </label>
      </div>

      {/* ── Acciones ─────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="live-launch-btn w-full justify-center text-[13px] tracking-[0.08em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SaveIcon />
          {isLoading ? 'Guardando…' : 'Guardar Cambios'}
        </button>
        <Link href="/store" className="store-cancel-btn">
          <XIcon />
          Cancelar
        </Link>
      </div>

    </form>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/store" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display font-bold text-[15px] tracking-[0.08em] uppercase text-(--brand-400)">
              Editar Tienda
            </span>
          </div>
          <button className="home-nav-icon" aria-label="Opciones">⋮</button>
        </div>

        <div className="px-5 pt-4 pb-2 reveal d1">
          {formContent('mobile')}
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/store"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-display font-bold text-[15px] tracking-[0.08em] uppercase text-(--brand-400)">
            Editar Tienda
          </span>
          <div className="w-20" />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            {formContent('desktop')}
          </div>
        </div>
      </div>
    </>
  )
}
