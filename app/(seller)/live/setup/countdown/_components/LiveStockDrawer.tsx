'use client'

import { useEffect, useState } from 'react'
import {
  getLiveProducts,
  pinLiveProduct,
  type LiveProductApiResponse,
} from '@/lib/liveActions'

export type LiveProduct = {
  id: string
  name: string
  price: number
  currency: string
  stock: number
  isHot: boolean
  isPinned: boolean
  imageUrl?: string | null
}

function mapProduct(api: LiveProductApiResponse): LiveProduct {
  return {
    id:       api.id,
    name:     api.productNameSnapshot,
    price:    api.priceSnapshot,
    currency: api.currencySnapshot,
    stock:    api.stockAllocated - api.stockSold,
    isHot:    api.isHot,
    isPinned: api.isPinned,
    imageUrl: api.imageUrl,
  }
}

type Props = {
  liveId: string
  open: boolean
  onClose: () => void
  onLaunch?: (product: LiveProduct) => void
  onAddProduct: () => void
}

export function LiveStockDrawer({ liveId, open, onClose, onLaunch, onAddProduct }: Props) {
  const [products, setProducts] = useState<LiveProduct[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    getLiveProducts(liveId).then((result) => {
      if (result.ok) {
        setProducts(result.products.map(mapProduct))
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [open, liveId])

  if (!open) return null

  function handleLaunch(product: LiveProduct) {
    onLaunch?.(product)
    onClose()
    void pinLiveProduct(liveId, product.id)
  }

  return (
    <>
      <div className="live-stock-overlay" onClick={onClose} aria-hidden="true" />

      <div
        className="live-stock-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Gestión de Stock"
      >
        <div className="live-stock-handle" />

        {/* Header */}
        <div className="live-stock-header">
          <div className="live-stock-header-left">
            <div className="live-stock-header-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1 9h16" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 5V3a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="live-stock-title">Gestión de Stock</span>
          </div>
          <button className="live-stock-close" onClick={onClose} aria-label="Cerrar" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="live-stock-body">
          {/* Add product CTA */}
          <button className="live-stock-add-btn" type="button" onClick={onAddProduct}>
            <div className="live-stock-add-icon" aria-hidden="true">+</div>
            <span className="live-stock-add-text">
              Añadir Producto<br />en Caliente
            </span>
          </button>

          {/* Section label */}
          <div className="live-stock-section-header">
            <span className="live-stock-section-label">
              Productos en Vivo ({products.length})
            </span>
            <button className="live-stock-sort-btn" type="button" aria-label="Ordenar productos">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <path d="M1 2h16M4 7h10M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* States */}
          {loading && (
            <p className="live-stock-status-text">Cargando productos...</p>
          )}
          {error && !loading && (
            <p className="live-stock-status-text live-stock-status-error">{error}</p>
          )}

          {/* Product list */}
          {!loading && !error && (
            <div className="live-stock-list">
              {products.length === 0 ? (
                <p className="live-stock-status-text">Sin productos cargados aún.</p>
              ) : products.map((product) => {
                const hasStock = product.stock > 0
                return (
                  <div
                    key={product.id}
                    className={`live-stock-item${!hasStock ? ' no-stock' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="live-stock-thumb" aria-hidden="true">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        '📦'
                      )}
                      {product.isHot && (
                        <span className="live-stock-hot-badge">HOT</span>
                      )}
                      <div className={`live-stock-thumb-badge ${hasStock ? 'available' : 'sold-out'}`}>
                        {hasStock ? `${product.stock} DISP` : 'SOLD OUT'}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="live-stock-info">
                      <div className="live-stock-item-name">{product.name}</div>
                      <div className="live-stock-item-price">
                        ${product.price.toLocaleString('es-MX')} <span>{product.currency}</span>
                      </div>
                    </div>

                    {/* Action */}
                    {hasStock ? (
                      <button
                        className={`live-stock-launch-btn ${product.isHot ? 'hot' : 'normal'}`}
                        type="button"
                        onClick={() => handleLaunch(product)}
                        aria-label={`Lanzar ${product.name}`}
                      >
                        <span className="live-stock-launch-icon" aria-hidden="true">🚀</span>
                        <span className="live-stock-launch-text">Lanzar</span>
                      </button>
                    ) : (
                      <div className="live-stock-nostock" aria-label="Sin stock disponible">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                          <rect x="4" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="live-stock-nostock-text">No Stock</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
