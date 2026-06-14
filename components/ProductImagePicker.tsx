'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export type ExistingImage = {
  id: string
  url: string
  position: number
  primary: boolean
}

export type PickerState = {
  newFiles: File[]
  deletedImageIds: string[]
}

type ExistingItem = { kind: 'existing'; id: string; url: string }
type NewItem = { kind: 'new'; file: File; previewUrl: string }
type PickerItem = ExistingItem | NewItem

type Props = {
  existingImages?: ExistingImage[]
  onChange: (state: PickerState) => void
}

export function ProductImagePicker({ existingImages, onChange }: Props) {
  const [items, setItems] = useState<PickerItem[]>(() =>
    (existingImages ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => ({ kind: 'existing', id: img.id, url: img.url }))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const newFiles = items.filter((i): i is NewItem => i.kind === 'new').map((i) => i.file)
    const allExistingIds = (existingImages ?? []).map((img) => img.id)
    const remainingIds = new Set(
      items.filter((i): i is ExistingItem => i.kind === 'existing').map((i) => i.id)
    )
    const deletedImageIds = allExistingIds.filter((id) => !remainingIds.has(id))
    onChange({ newFiles, deletedImageIds })
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      items
        .filter((i): i is NewItem => i.kind === 'new')
        .forEach((i) => URL.revokeObjectURL(i.previewUrl))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newItems: NewItem[] = files.map((file) => ({
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setItems((prev) => [...prev, ...newItems])
    e.target.value = ''
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const isEmpty = items.length === 0

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {isEmpty ? (
        <button
          type="button"
          className="img-picker-empty-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-[40px] opacity-40">📷</span>
          <span className="text-[12px] text-(--ink-3) font-medium">Subir imágenes del producto</span>
          <span className="text-[10px] text-(--ink-4) mt-1">JPG, PNG o WebP · Máx. 5 MB c/u</span>
        </button>
      ) : (
        <div className="img-picker-grid">
          {items.map((item, idx) => {
            const src = item.kind === 'existing' ? item.url : item.previewUrl
            const key = item.kind === 'existing' ? item.id : item.previewUrl
            return (
              <div key={key} className="img-picker-thumb-wrap">
                <Image
                  src={src}
                  alt={`Imagen ${idx + 1}`}
                  width={96}
                  height={96}
                  className="img-picker-thumb"
                  unoptimized={item.kind === 'new'}
                />
                {idx === 0 && <span className="img-picker-primary-badge">★</span>}
                <button
                  type="button"
                  className="img-picker-remove-btn"
                  onClick={() => removeItem(idx)}
                  aria-label="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            className="img-picker-add-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-[22px] opacity-50">+</span>
            <span className="text-[9px] font-bold tracking-[0.10em] text-(--ink-3) uppercase mt-1">
              Agregar
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
