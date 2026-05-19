'use client'

import Link from 'next/link'

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
        <Dots total={total} current={current} />
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
        <Dots total={total} current={current} />
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
      <Dots total={total} current={current} />
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

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-livento-pink'
              : 'w-2 bg-white/30'
          }`}
        />
      ))}
    </div>
  )
}
