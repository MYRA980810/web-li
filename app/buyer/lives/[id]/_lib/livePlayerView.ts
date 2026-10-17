import type { CartLineView, CartStoreGroupView } from '@/lib/types'
import type { LiveOrderItem } from '@/lib/liveActions'

// Pure view helpers for the buyer live player screen.

function compact(value: number): string {
  const scaled = Math.round(value * 10) / 10
  return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1)
}

/** 862 → "862 seguidores", 12800 → "12.8 mil seguidores", 1.25M → "1.3 M seguidores". */
export function formatFollowerCount(count: number): string {
  const n = Math.max(0, Math.floor(count))
  if (n === 1) return '1 seguidor'
  if (n < 1000) return `${n} seguidores`
  if (n < 1_000_000) return `${compact(n / 1000)} mil seguidores`
  return `${compact(n / 1_000_000)} M seguidores`
}

/** Locale-grouped count (viewers, likes); em dash while unknown. */
export function formatPlainCount(count: number | null): string {
  if (count === null) return '—'
  return Math.max(0, Math.floor(count)).toLocaleString('es-MX')
}

export function stockRemaining(product: { stockAllocated: number; stockSold: number }): number {
  return Math.max(0, product.stockAllocated - product.stockSold)
}

export type BagCartLine = CartLineView & { storeId: string; lineTotal: number }

export type CartBagSummary = { lines: BagCartLine[]; total: number }

/** Flattens the multi-store cart for the bag sheet. Live-exclusive lines stay
 * visible but are not payable from the regular cart, so they are excluded
 * from the total. */
export function cartBagSummary(groups: CartStoreGroupView[]): CartBagSummary {
  const lines: BagCartLine[] = []
  let total = 0
  for (const group of groups) {
    for (const l of group.lines) {
      const lineTotal = l.unitPrice * l.quantity
      lines.push({ ...l, storeId: group.storeId, lineTotal })
      if (l.blockedReason === null) total += lineTotal
    }
  }
  return { lines, total }
}

export type LiveOrderSummary = { items: LiveOrderItem[]; count: number; total: number }

export function liveOrderSummary(order: { items: LiveOrderItem[] } | null): LiveOrderSummary {
  if (!order) return { items: [], count: 0, total: 0 }
  const total = order.items.reduce((sum, item) => sum + item.subtotal, 0)
  return { items: order.items, count: order.items.length, total }
}

/** Newest `max` entries, preserving chronological order. */
export function recentMessages<T>(messages: readonly T[], max: number): T[] {
  return messages.slice(Math.max(0, messages.length - max))
}
