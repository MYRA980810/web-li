'use client'

import { ProductImagePicker, type PickerState } from '@/components/ProductImagePicker'

export type HotProductDraft = {
  pickerState: PickerState
  name: string
  description: string
  price: string
  stock: string
}

export const emptyHotProductDraft: HotProductDraft = {
  pickerState: { newFiles: [], deletedImageIds: [] },
  name: '',
  description: '',
  price: '',
  stock: '',
}

export function hotProductDraftToFormData(draft: HotProductDraft): FormData {
  const fd = new FormData()
  fd.set('name', draft.name.trim())
  fd.set('price', draft.price || '0')
  fd.set('currency', 'MXN')
  fd.set('stockAllocated', draft.stock || '0')
  if (draft.pickerState.newFiles[0]) {
    fd.set('image', draft.pickerState.newFiles[0])
  }
  return fd
}

type Props = {
  idPrefix: string
  draft: HotProductDraft
  onChange: (draft: HotProductDraft) => void
  disabled?: boolean
}

// Shared field set behind both hot-product flows: the immediate "Añadir
// Producto en Caliente" drawer (during a live) and the deferred "Añadir
// Nuevo" drawer (go-live setup, before the live exists).
export function HotProductFields({ idPrefix, draft, onChange, disabled }: Props) {
  function set<K extends keyof HotProductDraft>(key: K, value: HotProductDraft[K]) {
    onChange({ ...draft, [key]: value })
  }

  return (
    <>
      {/* Photo */}
      <div className="live-add-field">
        <span className="store-form-label">Foto del Producto</span>
        <ProductImagePicker onChange={(pickerState) => set('pickerState', pickerState)} />
      </div>

      {/* Name */}
      <div className="live-add-field">
        <label className="store-form-label" htmlFor={`${idPrefix}-name`}>
          Nombre del Producto
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          className="store-input"
          placeholder="Ej. Neon Pulse Jacket"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          disabled={disabled}
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div className="live-add-field">
        <label className="store-form-label" htmlFor={`${idPrefix}-desc`}>
          Descripción
        </label>
        <textarea
          id={`${idPrefix}-desc`}
          className="store-input"
          placeholder="Describí brevemente el producto..."
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          disabled={disabled}
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Price */}
      <div className="live-add-field">
        <span className="store-form-label">Precio</span>
        <div className="live-add-price-row">
          <span className="live-add-price-prefix">$</span>
          <input
            type="text"
            inputMode="decimal"
            className="live-add-price-input"
            placeholder="0.00"
            value={draft.price}
            onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, ''))}
            disabled={disabled}
            aria-label="Precio del producto"
          />
          <div className="live-add-currency">MXN</div>
        </div>
      </div>

      {/* Stock */}
      <div className="live-add-field">
        <label className="store-form-label" htmlFor={`${idPrefix}-stock`}>
          Cantidad en Stock
        </label>
        <input
          id={`${idPrefix}-stock`}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="store-input"
          placeholder="Mínimo 1"
          value={draft.stock}
          onChange={(e) => set('stock', e.target.value.replace(/[^0-9]/g, ''))}
          disabled={disabled}
          aria-label="Cantidad en stock"
        />
      </div>
    </>
  )
}
