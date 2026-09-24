'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { BagIcon } from '@/components/icons/BuyerNavIcons'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import { formatMxn } from '@/lib/format'

export function BuyerCartBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { groups, count } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || count === 0 || pathname.startsWith('/buyer/cart')) return null

  const total = groups.reduce(
    (sum, g) => sum + g.lines.reduce((lineSum, l) => lineSum + l.unitPrice * l.quantity, 0),
    0,
  )

  return createPortal(
    <button onClick={() => router.push('/buyer/cart')} className="buyer-cart-bar lg:hidden" aria-label="Ver carrito">
      <span className="buyer-cart-bar-icon">
        <BagIcon active />
        <span className="buyer-cart-bar-badge">{count}</span>
      </span>
      <span className="flex flex-col items-start min-w-0 flex-1">
        <span className="buyer-cart-bar-title">Ver carrito</span>
        <span className="buyer-cart-bar-subtitle">
          {count} {count === 1 ? 'producto' : 'productos'} · {formatMxn(total)}
        </span>
      </span>
      <span className="buyer-cart-bar-arrow">›</span>
    </button>,
    document.body,
  )
}
