import { sellerInitials } from '../_lib/livesView'

export type StoreAvatarProps = {
  sellerName: string | null
  size?: 'sm' | 'md'
  stacked?: boolean
}

const SIZE_CLASS: Record<NonNullable<StoreAvatarProps['size']>, string> = {
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
}

/** Gradient square with the store initials — the backend exposes no store avatar on live cards. */
export function StoreAvatar({ sellerName, size = 'sm', stacked = false }: StoreAvatarProps) {
  return (
    <span className={`buyer-lives-store-avatar ${SIZE_CLASS[size]}${stacked ? ' stacked' : ''}`} aria-hidden="true">
      {sellerInitials(sellerName)}
    </span>
  )
}
