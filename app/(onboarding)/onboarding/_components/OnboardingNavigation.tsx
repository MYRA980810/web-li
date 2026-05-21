'use client'

import Link from 'next/link'
import { OnboardingProgress } from './OnboardingProgress'

type OnboardingNavigationProps = {
  current: number
  total: number
  onNext: () => void
  onPrev: () => void
}

export function OnboardingNavigation({
  current,
  total,
  onNext,
  onPrev,
}: OnboardingNavigationProps) {
  const isFirst = current === 0
  const isLast = current === total - 1

  if (isFirst) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-4 items-center">
        <OnboardingProgress total={total} current={current} />
        <button
          onClick={onNext}
          type="button"
          className="w-full py-4 rounded-2xl bg-livento-pink text-white font-semibold text-base"
        >
          Siguiente →
        </button>
      </div>
    )
  }

  if (isLast) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-4 items-center">
        <OnboardingProgress total={total} current={current} />
        <Link
          href="/register"
          className="w-full py-4 rounded-2xl bg-livento-pink text-white font-semibold text-base text-center block"
        >
          Empezar →
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm flex items-center justify-between">
      <button
        onClick={onPrev}
        type="button"
        aria-label="Anterior"
        className="w-12 h-12 rounded-full bg-livento-card flex items-center justify-center text-white"
      >
        ←
      </button>
      <OnboardingProgress total={total} current={current} />
      <button
        onClick={onNext}
        type="button"
        aria-label="Siguiente"
        className="w-12 h-12 rounded-full bg-livento-pink flex items-center justify-center text-white"
      >
        →
      </button>
    </div>
  )
}
