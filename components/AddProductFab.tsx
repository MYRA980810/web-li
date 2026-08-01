'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export function AddProductFab() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(
    <Link href="/store/products/new" className="stock-fab lg:hidden" aria-label="Agregar producto">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 1v16M1 9h16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    </Link>,
    document.body
  )
}
