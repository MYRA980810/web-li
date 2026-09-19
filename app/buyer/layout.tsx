import { getToken } from '@/lib/fetchWithAuth'
import { getCart } from '@/lib/cartActions'
import { CartProvider } from './_providers/CartProvider'
import { hydrateCartGroups } from '@/lib/cartHydration'
import { BuyerCartBar } from '@/components/BuyerCartBar'
import type { CartStoreGroupView } from '@/lib/types'

// Uses getToken() (not requireToken()) — anonymous buyers must still be able
// to browse /buyer/stores/**. Cart mutations gate individually via
// requireToken() inside lib/cartActions.ts.
export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken()

  let initialGroups: CartStoreGroupView[] = []
  if (token) {
    const result = await getCart()
    if (result.ok) initialGroups = await hydrateCartGroups(result.cart, new Map())
  }

  return (
    <CartProvider initialGroups={initialGroups}>
      {children}
      <BuyerCartBar />
    </CartProvider>
  )
}
