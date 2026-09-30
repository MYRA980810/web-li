import type { ReactNode } from 'react'

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
