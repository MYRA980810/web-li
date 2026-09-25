'use client'

import { BellIcon } from './LivesIcons'

export type ReminderBellProps = {
  subscribed: boolean
  pending: boolean
  onToggle: () => void
  size?: 'md' | 'lg'
}

export function ReminderBell({ subscribed, pending, onToggle, size = 'md' }: ReminderBellProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={subscribed}
      aria-label={subscribed ? 'Quitar recordatorio' : 'Avisarme cuando empiece'}
      className={`buyer-lives-bell${size === 'lg' ? ' lg' : ''}${subscribed ? ' active' : ''}`}
    >
      <BellIcon size={size === 'lg' ? 20 : 16} />
    </button>
  )
}
