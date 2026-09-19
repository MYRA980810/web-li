import { getStoreById } from '@/lib/buyerStoreActions'
import type { CartLineView, CartStoreGroupView } from '@/lib/types'
import type { CombinedCartResponse } from '@/lib/cartActions'

export type StoreInfo = { name: string; logoUrl: string | null }

export async function hydrateCartGroups(
  cart: CombinedCartResponse,
  cache: Map<string, StoreInfo>,
): Promise<CartStoreGroupView[]> {
  const groups: CartStoreGroupView[] = []

  for (const storeGroup of cart.stores) {
    if (storeGroup.lines.length === 0) continue

    let info = cache.get(storeGroup.storeId)
    if (!info) {
      const store = await getStoreById(storeGroup.storeId)
      info = { name: store?.name ?? 'Tienda', logoUrl: store?.logoUrl ?? null }
      cache.set(storeGroup.storeId, info)
    }

    const lines: CartLineView[] = storeGroup.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      name: l.name,
      imageUrl: l.imageUrl,
      unitPrice: l.unitPrice,
      currency: l.currency,
      quantity: l.quantity,
      availableStock: l.availableStock,
      blockedReason: l.blockedReason,
    }))

    groups.push({ storeId: storeGroup.storeId, storeName: info.name, storeLogoUrl: info.logoUrl, lines })
  }

  return groups
}
