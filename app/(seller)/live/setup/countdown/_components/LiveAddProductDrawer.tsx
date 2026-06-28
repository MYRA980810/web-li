'use client'

import { useState } from 'react'
import { ProductImagePicker, type PickerState } from '@/components/ProductImagePicker'
import { addHotLiveProduct } from '@/lib/liveActions'
import type { LiveProduct } from './LiveStockDrawer'

type Props = {
  liveId: string
  open: boolean
  onClose: () => void
  onSave: (product: LiveProduct) => void
}

export function LiveAddProductDrawer({ liveId, open, onClose, onSave }: Props) {
  const [pickerState, setPickerState] = useState<PickerState>({ newFiles: [], deletedImageIds: [] })
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [price,       setPrice]       = useState('')
  const [stock,       setStock]       = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  if (!open) return null

  function handlePriceInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPrice(e.target.value.replace(/[^0-9.]/g, ''))
  }

  async function handleSubmit() {
    if (!name.trim()) return
    const stockVal = parseInt(stock, 10)
    if (!stockVal || stockVal < 1) {
      setError('El stock debe ser mínimo 1')
      return
    }

    setIsLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('price', price || '0')
    fd.set('currency', 'MXN')
    fd.set('stockAllocated', String(stockVal))
    if (pickerState.newFiles[0]) {
      fd.set('image', pickerState.newFiles[0])
    }

    const result = await addHotLiveProduct(liveId, fd)

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    const api = result.product
    const product: LiveProduct = {
      id:       api.id,
      name:     api.productNameSnapshot,
      price:    api.priceSnapshot,
      currency: api.currencySnapshot,
      stock:    api.stockAllocated - api.stockSold,
      isHot:    api.isHot,
      isPinned: api.isPinned,
      imageUrl: api.imageUrl,
    }

    onSave(product)
    handleReset()
  }

  function handleReset() {
    setPickerState({ newFiles: [], deletedImageIds: [] })
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setIsLoading(false)
    setError(null)
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  return (
    <>
      <div className="live-stock-overlay" onClick={handleClose} aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Añadir Producto en Caliente"
      >
        <div className="live-stock-handle" />

        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <span className="live-stock-title">Añadir Producto en Caliente</span>
          </div>
          <button
            className="live-stock-close"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          <div className="live-add-form">

            {/* Photo */}
            <div className="live-add-field">
              <span className="store-form-label">Foto del Producto</span>
              <ProductImagePicker onChange={setPickerState} />
            </div>

            {/* Name */}
            <div className="live-add-field">
              <label className="store-form-label" htmlFor="lap-name">
                Nombre del Producto
              </label>
              <input
                id="lap-name"
                type="text"
                className="store-input"
                placeholder="Ej. Neon Pulse Jacket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div className="live-add-field">
              <label className="store-form-label" htmlFor="lap-desc">
                Descripción
              </label>
              <textarea
                id="lap-desc"
                className="store-input"
                placeholder="Describí brevemente el producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
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
                  value={price}
                  onChange={handlePriceInput}
                  disabled={isLoading}
                  aria-label="Precio del producto"
                />
                <div className="live-add-currency">MXN</div>
              </div>
            </div>

            {/* Stock */}
            <div className="live-add-field">
              <label className="store-form-label" htmlFor="lap-stock">
                Cantidad en Stock
              </label>
              <input
                id="lap-stock"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                className="store-input"
                placeholder="Mínimo 1"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isLoading}
                aria-label="Cantidad en stock"
              />
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: '#ff4d6d', fontSize: '13px', margin: 0 }}>{error}</p>
            )}

            {/* CTA */}
            <div className="live-add-cta-group">
              <button
                type="button"
                className="live-add-cta"
                onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 1L8.8 5.4H13.4L9.7 8.1L11.1 12.5L7 9.8L2.9 12.5L4.3 8.1L0.6 5.4H5.2L7 1Z" fill="currentColor" />
                </svg>
                {isLoading ? 'Guardando...' : 'Guardar y Lanzar'}
              </button>
              <p className="live-add-cta-sub">
                Sincronización inmediata con el carrito del espectador
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
