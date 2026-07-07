'use client'

import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

const MOCK_GUIDES = [
  { customerName: 'Marcos Silva', productName: 'Sneakers Jordan Retro' },
  { customerName: 'Ana López', productName: 'Hoodie Premium Oversize' },
  { customerName: 'Camila Rodríguez', productName: 'Campera Denim Vintage' },
  { customerName: 'Lucas Fernández', productName: 'Buzo Tricapa Negro' },
  { customerName: 'Valentina Torres', productName: 'Zapatillas Running Pro' },
]

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

type Props = {
  orderCount: number
  onDownloadPdf: () => void
  onGoToShipments: () => void
}

export function GuidesReadyScreen({ orderCount, onDownloadPdf, onGoToShipments }: Props) {
  const count = Math.max(1, orderCount)
  const guides = Array.from({ length: count }, (_, i) => {
    const mock = MOCK_GUIDES[i % MOCK_GUIDES.length]
    return { id: `mock-guide-${i}`, ...mock, code: `MX-${4821 + i}` }
  })

  const body = (
    <>
      <div className="live-success-circle">
        <span className="live-success-ring" aria-hidden="true" />
        <span className="live-success-ring outer" aria-hidden="true" />
        <span className="text-[44px] font-bold text-brand-400">✓</span>
      </div>

      <div className="text-center flex flex-col gap-2">
        <h1 className="font-display font-extrabold text-[26px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          ¡Guías <span className="grad-text">Listas</span>!
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          Se generaron {count} guía{count === 1 ? '' : 's'} de envío para este live.
        </p>
      </div>

      <div className="live-guides-pickup-card w-full">
        <div className="live-guides-pickup-header">
          <span className="live-guides-pickup-label">Recolección Programada</span>
          <span className="store-info-status-chip pending">Pendiente</span>
        </div>

        <div className="live-guides-pickup-row">
          <span className="icon" aria-hidden="true">📅</span>
          <span>Disponible desde hoy a partir de las <strong className="text-(--ink-0)">14:00 hrs</strong></span>
        </div>

        <div className="live-guides-pickup-row">
          <span className="icon" aria-hidden="true">ℹ️</span>
          <span>99minutos pasará a recoger tus paquetes. Te notificaremos cuando el repartidor esté en camino.</span>
        </div>

        <div className="live-guides-warning">
          <span aria-hidden="true">⚠️</span>
          <span>Ten tus paquetes listos y etiquetados</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <span className="live-stock-section-label">Resumen de Guías</span>
        <div className="live-guides-summary-row">
          {guides.map((guide) => (
            <div key={guide.id} className="live-guides-summary-card">
              <span className="live-guides-summary-avatar">{initials(guide.customerName)}</span>
              <div>
                <div className="live-guides-summary-name">{guide.customerName}</div>
                <div className="live-guides-summary-product">{guide.productName}</div>
              </div>
              <div className="live-guides-summary-footer">
                <span className="live-guides-summary-code">Guía #{guide.code}</span>
                <span aria-hidden="true">🏷️</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button type="button" className="live-picker-cta" onClick={onDownloadPdf}>
          📄 Descargar PDF de Guías
        </button>
        <button type="button" className="live-finished-secondary-btn" onClick={onGoToShipments}>
          Ir a Mis Envíos
        </button>
        <p className="live-finished-info justify-center text-center">
          <span aria-hidden="true">ℹ️</span>
          Recibirás una notificación cuando el repartidor esté en camino a recoger tus paquetes.
        </p>
      </div>
    </>
  )

  return (
    <>
      <Ambient />

      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-12 flex flex-col items-center gap-6 reveal d1">{body}</div>
        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-center justify-center py-12 px-8">
          <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center reveal d1">{body}</div>
        </div>
      </div>
    </>
  )
}
