import type { Metadata } from 'next'
import { OnboardingSlides } from './_components/OnboardingSlides'

export const metadata: Metadata = {
  title: 'Bienvenido',
  description: 'Descubrí todo lo que podés hacer en la app.',
}

export default function OnboardingPage() {
  return <OnboardingSlides />
}
