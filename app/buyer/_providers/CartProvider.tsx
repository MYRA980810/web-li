'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  getCart,
  addToCart as addToCartAction,
  incrementCartItem as incrementCartItemAction,
  decrementCartItem as decrementCartItemAction,
  removeCartItem as removeCartItemAction,
  checkoutCart as checkoutCartAction,
  type AddToCartActionResult,
  type ChangeQuantityActionResult,
  type CheckoutCartActionResult,
  type CheckoutSelection,
} from '@/lib/cartActions'
import { hydrateCartGroups, type StoreInfo } from '@/lib/cartHydration'
import type { CartStoreGroupView } from '@/lib/types'

export function cartLineKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? 'novariant'}`
}

type CartContextValue = {
  groups: CartStoreGroupView[]
  count: number
  loading: boolean
  error: string | null
  refreshCart: () => Promise<void>
  addItem: (
    storeId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => Promise<AddToCartActionResult>
  incrementItem: (storeId: string, productId: string, variantId: string | null) => Promise<ChangeQuantityActionResult>
  decrementItem: (storeId: string, productId: string, variantId: string | null) => Promise<ChangeQuantityActionResult>
  removeItem: (storeId: string, productId: string, variantId: string | null) => Promise<void>
  checkout: (selected: Set<string>) => Promise<CheckoutCartActionResult>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  initialGroups,
  children,
}: {
  initialGroups: CartStoreGroupView[]
  children: React.ReactNode
}) {
  const [groups, setGroups] = useState(initialGroups)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const storeCacheRef = useRef<Map<string, StoreInfo>>(new Map())

  const refreshCart = useCallback(async () => {
    setLoading(true)
    const result = await getCart()
    if (result.ok) {
      const hydrated = await hydrateCartGroups(result.cart, storeCacheRef.current)
      setGroups(hydrated)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  const addItem = useCallback(
    async (storeId: string, productId: string, variantId: string | null, quantity: number) => {
      const result = await addToCartAction(storeId, productId, variantId, quantity)
      if (result.ok && result.result.success) await refreshCart()
      return result
    },
    [refreshCart],
  )

  const incrementItem = useCallback(async (storeId: string, productId: string, variantId: string | null) => {
    const result = await incrementCartItemAction(storeId, productId, variantId)
    if (result.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.storeId !== storeId
            ? g
            : {
                ...g,
                lines: g.lines.map((l) =>
                  l.productId === productId && l.variantId === variantId
                    ? {
                        ...l,
                        quantity: result.result.resultingQuantity,
                        availableStock: result.result.availableStock ?? l.availableStock,
                      }
                    : l,
                ),
              },
        ),
      )
    }
    return result
  }, [])

  const decrementItem = useCallback(async (storeId: string, productId: string, variantId: string | null) => {
    const result = await decrementCartItemAction(storeId, productId, variantId)
    if (result.ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.storeId !== storeId
            ? g
            : {
                ...g,
                lines: g.lines.map((l) =>
                  l.productId === productId && l.variantId === variantId
                    ? {
                        ...l,
                        quantity: result.result.resultingQuantity,
                        availableStock: result.result.availableStock ?? l.availableStock,
                      }
                    : l,
                ),
              },
        ),
      )
    }
    return result
  }, [])

  const removeItem = useCallback(
    async (storeId: string, productId: string, variantId: string | null) => {
      const result = await removeCartItemAction(storeId, productId, variantId)
      if (result.ok) await refreshCart()
    },
    [refreshCart],
  )

  const checkout = useCallback(
    async (selected: Set<string>) => {
      const items: CheckoutSelection[] = []
      for (const group of groups) {
        for (const line of group.lines) {
          if (selected.has(cartLineKey(line.productId, line.variantId))) {
            items.push({ storeId: group.storeId, productId: line.productId, variantId: line.variantId ?? undefined })
          }
        }
      }
      const result = await checkoutCartAction(items)
      if (result.ok) await refreshCart()
      return result
    },
    [groups, refreshCart],
  )

  const count = useMemo(() => groups.reduce((sum, g) => sum + g.lines.length, 0), [groups])

  const value: CartContextValue = {
    groups,
    count,
    loading,
    error,
    refreshCart,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    checkout,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
