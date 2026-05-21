'use client'

import Link from 'next/link'

type OnboardingNavigationProps = {
  current: number
  total: number
  onNext: () => void
  onPrev: () => void
  stretch?: boolean
}

export function OnboardingNavigation({ current, total, onNext, onPrev, stretch = false }: OnboardingNavigationProps) {
  const isLast = current === total - 1
  return (
    <>
      <button
        type="button"
        className="btn-circle ghost"
        onClick={onPrev}
        aria-label="Anterior"
        disabled={current === 0}
        style={{ opacity: current === 0 ? 0.4 : 1 }}
      >
        ←
      </button>
      {isLast ? (
        <Link
          href="/register"
          className="btn-pill"
          style={{ flex: stretch ? 1 : undefined, textDecoration: 'none', textAlign: 'center' }}
        >
          Empezar <span aria-hidden>→</span>
        </Link>
      ) : (
        <button
          type="button"
          className="btn-pill"
          onClick={onNext}
          style={{ flex: stretch ? 1 : undefined }}
        >
          Siguiente <span aria-hidden>→</span>
        </button>
      )}
    </>
  )
}
