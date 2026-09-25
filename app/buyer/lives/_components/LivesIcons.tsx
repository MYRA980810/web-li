import type { ReactNode } from 'react'
import type { LiveCategoryIconKey } from '@/lib/liveCategoryMock'

export type LivesIconProps = { size?: number }

function LineIcon({ size = 18, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function SlidersIcon({ size }: LivesIconProps) {
  return (
    <LineIcon size={size}>
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="15" cy="8" r="2.2" fill="var(--bg-2)" />
      <circle cx="9" cy="16" r="2.2" fill="var(--bg-2)" />
    </LineIcon>
  )
}

export function BellIcon({ size }: LivesIconProps) {
  return (
    <LineIcon size={size}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </LineIcon>
  )
}

export function TimerIcon({ size }: LivesIconProps) {
  return (
    <LineIcon size={size}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10v3.5l2 1.5" />
      <path d="M10 3h4" />
    </LineIcon>
  )
}

export function ChevronIcon({ size, up }: LivesIconProps & { up?: boolean }) {
  return <LineIcon size={size}>{up ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}</LineIcon>
}

export function CloseIcon({ size }: LivesIconProps) {
  return (
    <LineIcon size={size}>
      <path d="M6 6l12 12M18 6 6 18" />
    </LineIcon>
  )
}

export function BackIcon({ size }: LivesIconProps) {
  return (
    <LineIcon size={size}>
      <path d="M15 5l-7 7 7 7" />
    </LineIcon>
  )
}

const CATEGORY_PATHS: Record<LiveCategoryIconKey, ReactNode> = {
  all: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </>
  ),
  hanger: (
    <>
      <path d="M10 6.5a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.8" />
      <path d="M12 10.3 3.5 16.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8z" />
    </>
  ),
  lipstick: (
    <>
      <path d="M9.5 21V13h5v8z" />
      <path d="M10.5 13V7.5l3-3.5V13" />
    </>
  ),
  sofa: (
    <>
      <path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11" />
      <path d="M3 12.5a1.5 1.5 0 0 1 3 0V14h12v-1.5a1.5 1.5 0 0 1 3 0V18H3z" />
      <path d="M5 18v2M19 18v2" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 17.5h2" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8.5h13l-1 11.5h-11z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  shoe: (
    <>
      <path d="M3 17.5V9.5l3 1.5 3.5-2 2 3.5 5.5 2a3.5 3.5 0 0 1 3 3v0H3z" />
      <path d="M3 19.5h18" />
    </>
  ),
  diamond: (
    <>
      <path d="M7 4.5h10l3.5 5L12 20 3.5 9.5z" />
      <path d="M3.5 9.5h17M9.5 4.5 8 9.5l4 10.5 4-10.5-1.5-5" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" />
    </>
  ),
  bear: (
    <>
      <circle cx="6.5" cy="6.5" r="2.3" />
      <circle cx="17.5" cy="6.5" r="2.3" />
      <circle cx="12" cy="13" r="7" />
      <path d="M9.8 12v.01M14.2 12v.01" />
      <path d="M10 15.5a2.8 2.8 0 0 0 4 0" />
    </>
  ),
  paw: (
    <>
      <circle cx="7" cy="10" r="1.8" />
      <circle cx="10.5" cy="6.5" r="1.8" />
      <circle cx="13.5" cy="6.5" r="1.8" />
      <circle cx="17" cy="10" r="1.8" />
      <path d="M12 12c-2.8 0-5 3-5 5.2 0 1.4 1.1 2.3 2.5 2.3.9 0 1.6-.5 2.5-.5s1.6.5 2.5.5c1.4 0 2.5-.9 2.5-2.3C17 15 14.8 12 12 12z" />
    </>
  ),
  cup: (
    <>
      <path d="M4.5 10h12v4a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" />
      <path d="M16.5 11h1.5a2.5 2.5 0 0 1 0 5h-1.8" />
      <path d="M8.5 3.5v3M12.5 3.5v3" />
    </>
  ),
}

export type LiveCategoryIconProps = LivesIconProps & { icon: LiveCategoryIconKey }

export function LiveCategoryIcon({ icon, size }: LiveCategoryIconProps) {
  return <LineIcon size={size}>{CATEGORY_PATHS[icon]}</LineIcon>
}
