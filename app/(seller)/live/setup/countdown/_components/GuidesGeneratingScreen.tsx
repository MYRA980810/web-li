'use client'

import { useEffect, useState } from 'react'
import { Ambient } from '@/components/Ambient'

const STEPS = [
  'Validando inventario flash',
  'Sincronizando con courier',
  'Imprimiendo manifiesto digital',
]

const RADIUS = 76
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = {
  onComplete: () => void
}

function stepState(index: number, percent: number): 'done' | 'active' | 'pending' {
  const completed = Math.min(STEPS.length, Math.floor(percent / (100 / STEPS.length)))
  if (index < completed) return 'done'
  if (index === completed && percent < 100) return 'active'
  return percent === 100 ? 'done' : 'pending'
}

export function GuidesGeneratingScreen({ onComplete }: Props) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => {
      setPercent((p) => (p >= 100 ? 100 : p + 1))
    }, 30)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (percent < 100) return
    const t = setTimeout(onComplete, 500)
    return () => clearTimeout(t)
  }, [percent, onComplete])

  const offset = CIRCUMFERENCE * (1 - percent / 100)

  const inner = (
    <div className="live-guides-card glass-strong reveal">
      <div className="live-guides-ring-wrap">
        <svg width="168" height="168" viewBox="0 0 168 168">
          <circle cx="84" cy="84" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="84" cy="84" r={RADIUS} fill="none"
            stroke="url(#guides-ring-grad)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            transform="rotate(-90 84 84)"
          />
          <defs>
            <linearGradient id="guides-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff66b8" />
              <stop offset="50%" stopColor="#ff1f87" />
              <stop offset="100%" stopColor="#cf0a6b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="live-guides-ring-percent grad-text">{percent}%</span>
          <span className="live-guides-ring-label">Procesando</span>
        </div>
      </div>

      <div>
        <h1 className="live-guides-title">Generando Guías de Envío</h1>
        <p className="live-guides-subtitle mt-2">
          Estamos coordinando con <strong className="text-(--ink-0)">99minutos</strong> para preparar
          tus paquetes y asegurar un despacho inmediato.
        </p>
      </div>

      <div className="live-guides-checklist">
        {STEPS.map((label, i) => {
          const state = stepState(i, percent)
          return (
            <div key={label} className={`live-guides-step ${state}`}>
              <span className={`live-guides-step-icon ${state}`}>
                {state === 'done' && '✓'}
              </span>
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <Ambient />
      <div className="lg:hidden stage screen-enter flex flex-col items-center justify-center px-5 gap-4">
        {inner}
        <div className="live-guides-tip">
          <span aria-hidden="true">⚡</span>
          <span>Tip: Las guías generadas ahorran 24h de entrega.</span>
        </div>
      </div>
      <div className="hidden lg:flex stage screen-enter flex-col items-center justify-center gap-4">
        {inner}
        <div className="live-guides-tip">
          <span aria-hidden="true">⚡</span>
          <span>Tip: Las guías generadas ahorran 24h de entrega.</span>
        </div>
      </div>
    </>
  )
}
