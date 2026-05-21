'use client'

type OnboardingProgressProps = {
  total: number
  current: number
}

export function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          role="tab"
          aria-selected={i === current}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-livento-pink' : 'w-2 bg-white/30'
          }`}
        />
      ))}
    </div>
  )
}
