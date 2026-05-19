'use client'

import { useState } from 'react'
import { Slide01 } from './slides/Slide01'
import { Slide02 } from './slides/Slide02'
import { Slide03 } from './slides/Slide03'
import { OnboardingNavigation } from './OnboardingNavigation'

const SLIDES = [Slide01, Slide02, Slide03]

export function OnboardingSlides() {
  const [current, setCurrent] = useState(0)

  const ActiveSlide = SLIDES[current]

  function handleNext() {
    if (current < SLIDES.length - 1) setCurrent((prev) => prev + 1)
  }

  function handlePrev() {
    if (current > 0) setCurrent((prev) => prev - 1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-livento-dark">
      <div className="flex-1">
        <ActiveSlide />
      </div>
      <div className="flex justify-center px-6 pb-12 pt-4">
        <OnboardingNavigation
          current={current}
          total={SLIDES.length}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </div>
  )
}
