'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LAST_STORE_PATH_KEY } from '@/app/(seller)/store/_components/StorePathTracker'

export type SellerTab = 'home' | 'store' | 'ventas' | 'perfil'

type Props = { active: SellerTab }

const ROUTED_TABS: SellerTab[] = ['home', 'store']

const SWIPE_MIN_PX = 60
const SWIPE_AXIS_RATIO = 1.5

export function SellerBottomNav({ active }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const lastScrollY = useRef(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const activeRef = useRef(active)

  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { setMounted(true) }, [])

  function navigateTo(tab: SellerTab) {
    if (tab === 'home') {
      router.push('/home')
    } else if (tab === 'store') {
      const saved =
        typeof window !== 'undefined'
          ? (sessionStorage.getItem(LAST_STORE_PATH_KEY) ?? '/store')
          : '/store'
      router.push(saved)
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY.current

      if (y < 50) {
        setVisible(true)
      } else if (delta > 8) {
        setVisible(false)
      } else if (delta < -8) {
        setVisible(true)
      }

      lastScrollY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current

      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * SWIPE_AXIS_RATIO) return

      const idx = ROUTED_TABS.indexOf(activeRef.current)
      if (dx > 0) {
        const prev = ROUTED_TABS[idx - 1]
        if (prev) navigateTo(prev)
      } else {
        const next = ROUTED_TABS[idx + 1]
        if (next) navigateTo(next)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  return createPortal(
    <nav
      className="bottom-nav lg:hidden"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Link
        href="/home"
        className={`bottom-nav-item${active === 'home' ? ' active' : ''}`}
        aria-label="Home"
      >
        <span className="text-[18px]">🏠</span>
        <span className="text-[10px] font-semibold tracking-[0.12em]">Home</span>
      </Link>

      <button
        onClick={() => navigateTo('store')}
        className={`bottom-nav-item${active === 'store' ? ' active' : ''}`}
        aria-label="Store"
      >
        <span className="text-[18px]">🛍</span>
        <span className="text-[10px] font-semibold tracking-[0.12em]">Store</span>
      </button>

      <button
        className="bottom-nav-live"
        onClick={() => router.push('/live/setup')}
        aria-label="Iniciar Live"
      >
        ⚡
      </button>

      <button
        className={`bottom-nav-item${active === 'ventas' ? ' active' : ''}`}
        aria-label="Ventas"
      >
        <span className="text-[18px]">💰</span>
        <span className="text-[10px] font-semibold tracking-[0.12em]">Ventas</span>
      </button>

      <button
        className={`bottom-nav-item${active === 'perfil' ? ' active' : ''}`}
        aria-label="Perfil"
      >
        <span className="text-[18px]">👤</span>
        <span className="text-[10px] font-semibold tracking-[0.12em]">Perfil</span>
      </button>
    </nav>,
    document.body
  )
}
