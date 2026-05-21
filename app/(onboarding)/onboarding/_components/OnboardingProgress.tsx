'use client'

type OnboardingProgressProps = {
  total: number
  current: number
}

export function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  return (
    <div className="dots" role="tablist" aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          className={`dot${i === current ? ' active' : ''}`}
        />
      ))}
    </div>
  )
}
