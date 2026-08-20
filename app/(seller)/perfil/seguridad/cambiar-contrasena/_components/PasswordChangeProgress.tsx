const LockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.4" fill="currentColor" />
  </svg>
)

export type PasswordChangeProgressProps = { step: 1 | 2 | 3 }

export function PasswordChangeProgress({ step }: PasswordChangeProgressProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full reveal d1">
      <div className="pw-change-progress-track">
        <div className="pw-change-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <div className="pw-change-icon-badge">
        <LockIcon />
      </div>
    </div>
  )
}
