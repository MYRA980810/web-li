'use client'

import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { formatMxn } from '@/lib/format'
import type { CartBagSummary, LiveOrderSummary } from '../_lib/livePlayerView'

export type LiveBagTab = 'cart' | 'orders'

export type LiveBagSheetProps = {
  initialTab: LiveBagTab
  cart: CartBagSummary
  /** Buyer's OPEN order for this live (items bought with "Agregar"). */
  liveOrder: LiveOrderSummary
  onClose: () => void
  onCheckout: () => void
}

const noopSubscribe = () => () => {}

type BagRowProps = {
  name: string
  imageUrl: string | null
  detail: string
  amount: number
  tag?: string
}

function BagRow({ name, imageUrl, detail, amount, tag }: BagRowProps) {
  return (
    <li className="flex items-center gap-4">
      <div className="live-bag-thumb">
        {imageUrl && <Image src={imageUrl} alt={name} fill sizes="56px" className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-extrabold text-[16px] text-white truncate">{name}</p>
        <p className="text-[14px] text-white/55 truncate">
          {detail}
          {tag && <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-brand-300">{tag}</span>}
        </p>
      </div>
      <span className="font-display font-extrabold text-[16px] text-brand-300 shrink-0">{formatMxn(amount)}</span>
    </li>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-6 text-center text-[14px] text-white/55">{text}</p>
}

// Portal: keeps the sheet out of the stage's stacking context. The stage (and
// its <video>) stays mounted underneath, so the live keeps playing.
export function LiveBagSheet({ initialTab, cart, liveOrder, onClose, onCheckout }: LiveBagSheetProps) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const [tab, setTab] = useState<LiveBagTab>(initialTab)
  const baseId = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!isClient) return null

  const tabs: { id: LiveBagTab; label: string }[] = [
    { id: 'cart', label: `Carrito · ${cart.lines.length}` },
    { id: 'orders', label: `Mis compras · ${liveOrder.count}` },
  ]

  return createPortal(
    <>
      <div className="stock-filter-overlay" onClick={onClose} aria-hidden="true" />
      <div className="stock-filter-drawer lg:max-w-xl lg:mx-auto" role="dialog" aria-modal="true" aria-label="Bolsa">
        <div className="stock-filter-handle" aria-hidden="true" />

        <div className="flex flex-col gap-5 px-5 pt-5 pb-[max(env(safe-area-inset-bottom),20px)] overflow-y-auto">
          <div className="live-bag-tabs" role="tablist" aria-label="Bolsa">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`${baseId}-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className="live-bag-tab"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} className="flex flex-col gap-5">
            {tab === 'cart' ? (
              <>
                {cart.lines.length === 0 ? (
                  <EmptyState text="Tu carrito está vacío" />
                ) : (
                  <ul className="flex flex-col gap-4">
                    {cart.lines.map((l) => (
                      <BagRow
                        key={`${l.storeId}:${l.productId}:${l.variantId ?? 'novariant'}`}
                        name={l.name}
                        imageUrl={l.imageUrl}
                        detail={`${l.quantity} × ${formatMxn(l.unitPrice)}`}
                        amount={l.lineTotal}
                        tag={l.blockedReason === 'LIVE_EXCLUSIVE' ? 'Solo en live' : undefined}
                      />
                    ))}
                  </ul>
                )}
                <button type="button" onClick={onCheckout} disabled={cart.total === 0} className="live-bag-cta">
                  Ir a pagar · {formatMxn(cart.total)}
                </button>
              </>
            ) : liveOrder.count === 0 ? (
              <EmptyState text="Aún no has comprado en este live" />
            ) : (
              <>
                <ul className="flex flex-col gap-4">
                  {liveOrder.items.map((item) => (
                    <BagRow
                      key={item.id}
                      name={item.productName}
                      imageUrl={item.imageUrl}
                      detail={`${item.quantity} × ${formatMxn(item.unitPrice)}`}
                      amount={item.subtotal}
                    />
                  ))}
                </ul>
                <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5">
                  <span className="text-[14px] text-white/70">Total en este live</span>
                  <span className="font-display font-extrabold text-[16px] text-white">{formatMxn(liveOrder.total)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-[13px] text-white/50">El live sigue reproduciéndose mientras compras</p>
        </div>
      </div>
    </>,
    document.body,
  )
}
