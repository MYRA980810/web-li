export type NavIconProps = { active?: boolean }

export function HomeIcon({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.5 12 3.5l8.5 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-6v6H4.5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function SearchIcon({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.3" y2="15.3" />
    </svg>
  )
}

export function VideoIcon({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6.5" width="12" height="11" rx="2.2" />
      <path d="M15 10.2 21 7v10l-6-3.2z" />
    </svg>
  )
}

export function BagIcon({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 8h11l-.9 11.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8L6.5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function UserIcon({ active }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c.7-4.2 4.3-6.4 7.5-6.4s6.8 2.2 7.5 6.4" />
    </svg>
  )
}
