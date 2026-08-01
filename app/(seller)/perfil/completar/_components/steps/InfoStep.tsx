'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { UserProfile } from '@/lib/profileActions'
import { uploadProfileAvatar, updateAvatar, updateAlias } from '@/lib/profileActions'

export type InfoStepProps = {
  profile: UserProfile
  onNext: () => void
}

export function InfoStep({ profile, onNext }: InfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)
  const [alias, setAlias] = useState(profile.alias ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  async function handleSubmit() {
    setError(null)

    const aliasChanged = alias !== (profile.alias ?? '')
    if (!avatarFile && !aliasChanged) {
      onNext()
      return
    }

    setLoading(true)

    if (avatarFile) {
      const fd = new FormData()
      fd.append('file', avatarFile)
      const uploadResult = await uploadProfileAvatar(fd)
      if (!uploadResult.ok) {
        setLoading(false)
        setError(uploadResult.error)
        return
      }

      const avatarResult = await updateAvatar(uploadResult.url)
      if (!avatarResult.ok) {
        setLoading(false)
        setError(avatarResult.error)
        return
      }
    }

    if (aliasChanged) {
      const aliasResult = await updateAlias(alias)
      if (!aliasResult.ok) {
        setLoading(false)
        setError(aliasResult.error)
        return
      }
    }

    setLoading(false)
    onNext()
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="flex flex-col items-center gap-2">
        <div
          className="avatar-upload-ring"
          style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}
          onClick={() => fileInputRef.current?.click()}
        >
          {!avatarPreview && <span className="text-[28px]">📷</span>}
          <div className="avatar-upload-ring-badge">✏️</div>
        </div>
        <span className="store-form-label">Añade tu foto de perfil</span>
      </div>

      <div>
        <label className="store-form-label" htmlFor="wizard-alias">
          Tu Alias
        </label>
        <input
          id="wizard-alias"
          type="text"
          className="store-input"
          placeholder="Ej: neonstore"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="store-form-label">Nombre</span>
        <p className="text-[14px] text-(--ink-1) font-medium">
          {profile.firstName} {profile.lastName}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="store-form-label">Contacto</span>

        <div className="flex items-center justify-between px-4 py-3 rounded-(--r-lg) border border-(--line) bg-white/5">
          <span className="text-[11px] font-bold tracking-[0.10em] text-(--ink-3) uppercase">Email</span>
          {profile.email ? (
            <span className="text-[13px] text-(--ink-1) font-medium">{profile.email}</span>
          ) : (
            <span className="text-[11px] text-(--ink-4)">No proporcionado (opcional)</span>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-(--r-lg) border border-(--line) bg-white/5">
          <span className="text-[11px] font-bold tracking-[0.10em] text-(--ink-3) uppercase">Teléfono</span>
          {profile.phone ? (
            <span className="text-[13px] text-(--ink-1) font-medium">{profile.phone}</span>
          ) : (
            <span className="text-[11px] text-(--ink-4)">No proporcionado (opcional)</span>
          )}
        </div>
      </div>

      {error && <p className="text-[12px] text-brand-400">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Guardar y continuar'}
      </button>
    </div>
  )
}
