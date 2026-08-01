'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import type { UserProfile } from '@/lib/profileActions'
import { InfoStep } from './steps/InfoStep'
import { PagoStep } from './steps/PagoStep'
import { DireccionStep } from './steps/DireccionStep'
import { ListoStep } from './steps/ListoStep'

export type CompleteProfileWizardProps = {
  profile: UserProfile
}

type WizardStep = 'info' | 'pago' | 'direccion' | 'listo'

const STEPS: WizardStep[] = ['info', 'pago', 'direccion', 'listo']

const STEP_LABELS: Record<WizardStep, string> = {
  info: 'Info',
  pago: 'Pago',
  direccion: 'Dirección',
  listo: 'Listo',
}

function isWizardStep(value: string | null): value is WizardStep {
  return value === 'info' || value === 'pago' || value === 'direccion' || value === 'listo'
}

export function CompleteProfileWizard({ profile }: CompleteProfileWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepParam = searchParams.get('step')
  const step: WizardStep = isWizardStep(stepParam) ? stepParam : 'info'
  const retry = searchParams.get('retry') === '1'
  const stepIndex = STEPS.indexOf(step)

  const goToStep = useCallback((next: WizardStep) => {
    router.push(`/perfil/completar?step=${next}`)
  }, [router])

  function handleBack() {
    if (step === 'info') {
      router.push('/perfil')
      return
    }
    router.push(`/perfil/completar?step=${STEPS[stepIndex - 1]}`)
  }

  return (
    <>
      <Ambient />

      <div className="stage screen-enter">
        <div className="store-back-header">
          <button type="button" className="store-back-btn" onClick={handleBack} aria-label="Volver">
            ←
          </button>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">
              Mi Cuenta
            </span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Completar Perfil
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="px-5 pt-6 pb-10 max-w-md mx-auto w-full reveal d1">
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`wizard-step-pill${i < stepIndex ? ' done' : ''}${i === stepIndex ? ' active' : ''}`}
                >
                  <span className="wizard-step-num">{i < stepIndex ? '✓' : i + 1}</span>
                  {STEP_LABELS[s].toUpperCase()}
                </span>
                {i < STEPS.length - 1 && <span className="wizard-step-connector" />}
              </div>
            ))}
          </div>

          {step === 'info' && <InfoStep profile={profile} onNext={() => goToStep('pago')} />}
          {step === 'pago' && <PagoStep retry={retry} onNext={() => goToStep('direccion')} />}
          {step === 'direccion' && <DireccionStep onNext={() => goToStep('listo')} />}
          {step === 'listo' && <ListoStep />}
        </div>
      </div>
    </>
  )
}
