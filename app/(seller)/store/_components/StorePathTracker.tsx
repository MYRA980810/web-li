'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export const LAST_STORE_PATH_KEY = 'seller:last-store-path'
const SCROLL_KEY = 'seller:scroll-positions'

const TRANSIENT = ['/success', '/delete', '/setup']

function getScrollMap(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveScroll(pathname: string, y: number) {
  const map = getScrollMap()
  map[pathname] = y
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify(map))
}

export function StorePathTracker() {
  const pathname = usePathname()

  // Save last navigable store path
  useEffect(() => {
    const isTransient = TRANSIENT.some((seg) => pathname.includes(seg))
    if (!isTransient) {
      sessionStorage.setItem(LAST_STORE_PATH_KEY, pathname)
    }
  }, [pathname])

  // Save scroll position on scroll (debounced 150ms)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(() => saveScroll(pathname, window.scrollY), 150)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  // Restore scroll position after page transition (double-RAF ensures content is painted)
  useEffect(() => {
    const saved = getScrollMap()[pathname]
    if (!saved || saved <= 0) return

    let raf1: number
    let raf2: number
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: 'instant' })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [pathname])

  return null
}
