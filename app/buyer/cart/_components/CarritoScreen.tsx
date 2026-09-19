'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import { formatMxn } from '@/lib/format'
import { fallbackGradient, storeInitials } from '@/lib/visualFallbacks'
import { useCart, cartLineKey } from '@/app/buyer/_providers/CartProvider'
import type { StoreCheckoutResultResponse } from '@/lib/cartActions'
import type { CartLineView, CartStoreGroupView } from '@/lib/types'
import { CheckoutResultView } from './CheckoutResultView'

function QtyStepper({
  line,
  onDecrement,
  onIncrement,
}: {
  line: CartLineView
  onDecrement: () => void
  onIncrement: () => void
}) {
  const atMax = line.quantity >= line.availableStock

  return (
    <div className="buyer-qty-stepper">
      <button className="buyer-qty-btn" disabled={line.quantity <= 1} onClick={onDecrement} aria-label="Restar">−</button>
      <span className="text-[13px] font-bold text-(--ink-0) w-4 text-center">{line.quantity}</span>
      <button className="buyer-qty-btn" disabled={atMax} onClick={onIncrement} aria-label="Sumar">+</button>
    </div>
  )
}

export function CarritoScreen() {
  const router = useRouter()
  const cart = useCart()

  const [phase, setPhase] = useState<'cart' | 'result'>('cart')
  const [checkoutResults, setCheckoutResults] = useState<StoreCheckoutResultResponse[]>([])
  const [checkoutStoreNames, setCheckoutStoreNames] = useState<Map<string, string>>(new Map())
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(cart.groups.flatMap((g) => g.lines.map((l) => cartLineKey(l.productId, l.variantId)))),
  )
  const seenKeysRef = useRef<Set<string>>(
    new Set(cart.groups.flatMap((g) => g.lines.map((l) => cartLineKey(l.productId, l.variantId)))),
  )

  // Keeps `selected` in sync as the cart changes: newly-added lines are
  // auto-selected, removed lines drop out, existing selection state is kept.
  useEffect(() => {
    const currentKeys = new Set(cart.groups.flatMap((g) => g.lines.map((l) => cartLineKey(l.productId, l.variantId))))
    setSelected((prev) => {
      const next = new Set<string>()
      for (const key of currentKeys) {
        if (prev.has(key) || !seenKeysRef.current.has(key)) next.add(key)
      }
      return next
    })
    seenKeysRef.current = currentKeys
  }, [cart.groups])

  const totalItems = cart.groups.reduce((sum, g) => sum + g.lines.length, 0)
  const storeCount = cart.groups.length

  const selectedLines = useMemo(
    () => cart.groups.flatMap((g) => g.lines).filter((l) => selected.has(cartLineKey(l.productId, l.variantId))),
    [cart.groups, selected],
  )
  const selectedTotal = selectedLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const selectedCount = selectedLines.length

  function toggleItem(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleStore(group: CartStoreGroupView) {
    const keys = group.lines.map((l) => cartLineKey(l.productId, l.variantId))
    const allSelected = keys.every((k) => selected.has(k))
    setSelected((prev) => {
      const next = new Set(prev)
      for (const key of keys) {
        if (allSelected) next.delete(key)
        else next.add(key)
      }
      return next
    })
  }

  async function handleRemove(group: CartStoreGroupView, line: CartLineView) {
    await cart.removeItem(group.storeId, line.productId, line.variantId)
  }

  async function handlePagar() {
    if (selectedCount === 0 || checkingOut) return
    const storeNameSnapshot = new Map(cart.groups.map((g) => [g.storeId, g.storeName]))
    setCheckingOut(true)
    setCheckoutError(null)
    const result = await cart.checkout(selected)
    setCheckingOut(false)

    if (!result.ok) {
      setCheckoutError(result.error)
      return
    }
    setCheckoutStoreNames(storeNameSnapshot)
    setCheckoutResults(result.response.results)
    setPhase('result')
  }

  if (phase === 'result') {
    return (
      <>
        <Ambient />
        <div className="stage screen-enter">
          <div className="px-5 pt-5 pb-2 reveal d1 max-w-xl mx-auto w-full">
            <CheckoutResultView
              results={checkoutResults}
              storeNames={checkoutStoreNames}
              onContinue={() => router.push('/buyer/home')}
            />
          </div>
        </div>
      </>
    )
  }

  const content = (
    <div className="flex flex-col gap-5">
      {checkoutError && <p className="text-[13px] text-red-400 text-center">{checkoutError}</p>}
      {cart.error && <p className="text-[13px] text-red-400 text-center">{cart.error}</p>}

      {cart.groups.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-[40px] opacity-40">🛒</span>
          <p className="text-[14px] text-(--ink-3)">Tu carrito está vacío.</p>
        </div>
      ) : (
        cart.groups.map((group) => {
          const keys = group.lines.map((l) => cartLineKey(l.productId, l.variantId))
          const allSelected = keys.every((k) => selected.has(k))
          return (
            <div key={group.storeId} className="flex flex-col">
              <div className="buyer-cart-store-header">
                <button
                  className={`buyer-checkbox${allSelected ? ' checked' : ''}`}
                  onClick={() => toggleStore(group)}
                  aria-label={`Seleccionar todo de ${group.storeName}`}
                >
                  ✓
                </button>
                {group.storeLogoUrl ? (
                  <div className="buyer-store-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                    <Image src={group.storeLogoUrl} alt={group.storeName} fill sizes="28px" className="object-cover" />
                  </div>
                ) : (
                  <div className="buyer-store-avatar" style={{ width: 28, height: 28, fontSize: 11, background: fallbackGradient(group.storeId) }}>
                    {storeInitials(group.storeName)}
                  </div>
                )}
                <span className="text-[13px] font-bold text-(--ink-0) flex-1">{group.storeName}</span>
              </div>

              {group.lines.map((line) => {
                const key = cartLineKey(line.productId, line.variantId)
                return (
                  <div key={key} className="buyer-cart-item">
                    <button
                      className={`buyer-checkbox self-center${selected.has(key) ? ' checked' : ''}`}
                      onClick={() => toggleItem(key)}
                      aria-label={`Seleccionar ${line.name}`}
                    >
                      ✓
                    </button>
                    <div
                      className="buyer-cart-item-thumb"
                      style={line.imageUrl ? undefined : { background: fallbackGradient(line.productId) }}
                    >
                      {line.imageUrl && <Image src={line.imageUrl} alt={line.name} fill sizes="76px" className="object-cover" />}
                      {line.blockedReason === 'LIVE_EXCLUSIVE' && (
                        <span className="absolute top-1 left-1 z-10 live-badge compact">
                          <span className="dot" />
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold text-(--ink-0) leading-snug">{line.name}</span>
                        <button
                          onClick={() => handleRemove(group, line)}
                          className="text-(--ink-3) hover:text-(--ink-0) transition-colors shrink-0"
                          aria-label="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                      {line.blockedReason === 'LIVE_EXCLUSIVE' && (
                        <span className="buyer-inline-badge">Solo disponible en vivo</span>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[14px] font-bold text-(--ink-0)">{formatMxn(line.unitPrice)}</span>
                        <QtyStepper
                          line={line}
                          onDecrement={() => cart.decrementItem(group.storeId, line.productId, line.variantId)}
                          onIncrement={() => cart.incrementItem(group.storeId, line.productId, line.variantId)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="buyer-store-top-bar">
          <button onClick={() => router.back()} className="buyer-icon-btn" aria-label="Volver">←</button>
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-[15px] text-(--ink-0)">Mi carrito</span>
            <span className="text-[11px] text-(--ink-3)">{totalItems} artículos de {storeCount} {storeCount === 1 ? 'tienda' : 'tiendas'}</span>
          </div>
          <button className="text-[13px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">Editar</button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">{content}</div>

        <div className="buyer-sticky-footer">
          <div className="flex flex-col">
            <span className="text-[11px] text-(--ink-3)">{selectedCount} seleccionados</span>
            <span className="text-[19px] font-bold text-(--ink-0)">{formatMxn(selectedTotal)}</span>
          </div>
          <button className="live-launch-btn flex-1 justify-center" disabled={selectedCount === 0 || checkingOut} onClick={handlePagar}>
            {checkingOut ? 'Procesando...' : 'Pagar →'}
          </button>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="buyer-store-top-bar !px-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">← Volver</button>
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-[15px] text-(--ink-0)">Mi carrito</span>
            <span className="text-[11px] text-(--ink-3)">{totalItems} artículos de {storeCount} {storeCount === 1 ? 'tienda' : 'tiendas'}</span>
          </div>
          <button className="text-[13px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">Editar</button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-xl">{content}</div>
        </div>

        <div className="buyer-sticky-footer !justify-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-(--ink-3)">{selectedCount} seleccionados</span>
            <span className="text-[19px] font-bold text-(--ink-0)">{formatMxn(selectedTotal)}</span>
          </div>
          <button className="live-launch-btn" disabled={selectedCount === 0 || checkingOut} onClick={handlePagar}>
            {checkingOut ? 'Procesando...' : 'Pagar →'}
          </button>
        </div>
      </div>
    </>
  )
}
