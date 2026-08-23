'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BagIcon, HomeIcon, SearchIcon, UserIcon, VideoIcon, type NavIconProps } from '@/components/icons/BuyerNavIcons'

export type BuyerTab = 'home' | 'buscar' | 'lives' | 'compras' | 'perfil'

type Props = { active: BuyerTab }

const ROUTED_TABS: BuyerTab[] = ['home', 'buscar', 'lives', 'compras', 'perfil']

const TAB_ROUTES: Record<BuyerTab, string> = {
  home: '/buyer/home',
  buscar: '/buyer/buscar',
  lives: '/buyer/lives',
  compras: '/buyer/compras',
  perfil: '/buyer/perfil',
}

const TAB_ICONS: Record<BuyerTab, (props: NavIconProps) => React.JSX.Element> = {
  home: HomeIcon,
  buscar: SearchIcon,
  lives: VideoIcon,
  compras: BagIcon,
  perfil: UserIcon,
}

const TAB_LABELS: Record<BuyerTab, string> = {
  home: 'Inicio',
  buscar: 'Buscar',
  lives: 'Lives',
  compras: 'Compras',
  perfil: 'Perfil',
}

const SWIPE_MIN_PX = 60
const SWIPE_AXIS_RATIO = 1.5

export function BuyerBottomNav({ active }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const lastScrollY = useRef(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const activeRef = useRef(active)

  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { setMounted(true) }, [])

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
        if (prev) router.push(TAB_ROUTES[prev])
      } else {
        const next = ROUTED_TABS[idx + 1]
        if (next) router.push(TAB_ROUTES[next])
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
      className="bottom-nav buyer-bottom-nav lg:hidden"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {ROUTED_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab]
        const isActive = active === tab
        return (
          <Link
            key={tab}
            href={TAB_ROUTES[tab]}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label={TAB_LABELS[tab]}
          >
            {isActive && <span className="bottom-nav-indicator" />}
            <span className="bottom-nav-icon-wrap">
              <Icon active={isActive} />
            </span>
            <span className={`text-[10px] tracking-[0.12em]${isActive ? ' font-bold' : ' font-semibold'}`}>
              {TAB_LABELS[tab]}
            </span>
          </Link>
        )
      })}
    </nav>,
    document.body
  )
}
