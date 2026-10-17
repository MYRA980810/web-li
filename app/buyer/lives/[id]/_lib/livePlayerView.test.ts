import { describe, expect, it } from 'vitest'
import type { CartStoreGroupView } from '@/lib/types'
import {
  cartBagSummary,
  formatFollowerCount,
  formatPlainCount,
  liveOrderSummary,
  recentMessages,
  stockRemaining,
} from './livePlayerView'

describe('formatFollowerCount', () => {
  it('uses the singular for one follower', () => {
    expect(formatFollowerCount(1)).toBe('1 seguidor')
  })

  it('shows small counts verbatim', () => {
    expect(formatFollowerCount(0)).toBe('0 seguidores')
    expect(formatFollowerCount(862)).toBe('862 seguidores')
  })

  it('compacts thousands with "mil"', () => {
    expect(formatFollowerCount(12_800)).toBe('12.8 mil seguidores')
    expect(formatFollowerCount(3_000)).toBe('3 mil seguidores')
    expect(formatFollowerCount(1_049)).toBe('1 mil seguidores')
  })

  it('compacts millions with "M"', () => {
    expect(formatFollowerCount(1_250_000)).toBe('1.3 M seguidores')
  })
})

describe('formatPlainCount', () => {
  it('renders an em dash when the count is unknown', () => {
    expect(formatPlainCount(null)).toBe('—')
  })

  it('groups thousands in the app locale', () => {
    expect(formatPlainCount(1445)).toBe('1,445')
    expect(formatPlainCount(12)).toBe('12')
  })
})

describe('stockRemaining', () => {
  it('subtracts sold from allocated stock', () => {
    expect(stockRemaining({ stockAllocated: 10, stockSold: 3 })).toBe(7)
  })

  it('never goes below zero', () => {
    expect(stockRemaining({ stockAllocated: 2, stockSold: 5 })).toBe(0)
  })
})

function group(storeId: string, lines: CartStoreGroupView['lines']): CartStoreGroupView {
  return { storeId, storeName: storeId, storeLogoUrl: null, lines }
}

function line(overrides: Partial<CartStoreGroupView['lines'][number]>): CartStoreGroupView['lines'][number] {
  return {
    productId: 'p1',
    variantId: null,
    name: 'Producto',
    imageUrl: null,
    unitPrice: 100,
    currency: 'MXN',
    quantity: 1,
    availableStock: 10,
    blockedReason: null,
    ...overrides,
  }
}

describe('cartBagSummary', () => {
  it('returns an empty summary for an empty cart', () => {
    expect(cartBagSummary([])).toEqual({ lines: [], total: 0 })
  })

  it('flattens lines across stores and totals quantity × unit price', () => {
    const summary = cartBagSummary([
      group('s1', [line({ productId: 'a', unitPrice: 52_000, quantity: 1 })]),
      group('s2', [line({ productId: 'b', unitPrice: 100, quantity: 3 })]),
    ])
    expect(summary.total).toBe(52_300)
    expect(summary.lines.map((l) => [l.storeId, l.productId, l.lineTotal])).toEqual([
      ['s1', 'a', 52_000],
      ['s2', 'b', 300],
    ])
  })

  it('lists live-exclusive blocked lines but leaves them out of the payable total', () => {
    const summary = cartBagSummary([
      group('s1', [
        line({ productId: 'ok', unitPrice: 10, quantity: 2 }),
        line({ productId: 'blocked', unitPrice: 999, quantity: 1, blockedReason: 'LIVE_EXCLUSIVE' }),
      ]),
    ])
    expect(summary.lines).toHaveLength(2)
    expect(summary.total).toBe(20)
  })
})

describe('liveOrderSummary', () => {
  it('returns an empty summary when there is no active order', () => {
    expect(liveOrderSummary(null)).toEqual({ items: [], count: 0, total: 0 })
  })

  it('counts order lines and sums their subtotals', () => {
    const summary = liveOrderSummary({
      items: [
        { id: 'i1', productId: null, productName: 'Hot', unitPrice: 50, currency: 'MXN', quantity: 2, subtotal: 100, status: 'RESERVED', imageUrl: null },
        { id: 'i2', productId: 'p', productName: 'Blusa', unitPrice: 30, currency: 'MXN', quantity: 1, subtotal: 30, status: 'RESERVED', imageUrl: null },
      ],
    })
    expect(summary.count).toBe(2)
    expect(summary.total).toBe(130)
  })
})

describe('recentMessages', () => {
  it('keeps only the newest messages, oldest first', () => {
    expect(recentMessages([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5])
  })

  it('returns everything when under the limit', () => {
    expect(recentMessages([1, 2], 5)).toEqual([1, 2])
  })
})
