'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { BrandMark } from '../../_components/BrandMark'
import { OnboardingNavigation } from './OnboardingNavigation'
import { OnboardingProgress } from './OnboardingProgress'
import { PhoneDiscover, DesktopChipsDiscover, MobileChipsDiscover } from './slides/Slide01'
import { PhoneChat, DesktopChipsChat, MobileChipsChat } from './slides/Slide02'
import { PhoneShop, DesktopChipsShop, MobileChipsShop } from './slides/Slide03'

type ChipKind = 'live' | 'trend' | 'ship' | 'chat' | 'heart' | 'chat-2' | 'card' | 'stock'

type Step = {
  eyebrow: string
  titleTop: string
  titleEm: string
  body: string
  chips: { kind: ChipKind; label: string }[]
}

const STEPS: Step[] = [
  {
    eyebrow: 'Live commerce',
    titleTop: 'Descubre lo mejor en',
    titleEm: 'vivo',
    body: 'Las últimas tendencias en moda, tech y lifestyle, transmitidas en directo por los mejores creadores de Latinoamérica.',
    chips: [
      { kind: 'live',  label: '12 streams en vivo ahora' },
      { kind: 'trend', label: '+340 productos nuevos hoy' },
      { kind: 'ship',  label: 'Envío en 24h en 18 países' },
    ],
  },
  {
    eyebrow: 'Real-time chat',
    titleTop: 'Interactúa y',
    titleEm: 'participa',
    body: 'Chatea con el creador, envía reacciones y pregunta por tu talla, color o stock en tiempo real durante el live.',
    chips: [
      { kind: 'chat',   label: '@alex_m · ¿Hay talla M?' },
      { kind: 'heart',  label: '+248 reacciones esta hora' },
      { kind: 'chat-2', label: '@lucia_trend · ¡Me encanta!' },
    ],
  },
  {
    eyebrow: 'Smart shopping',
    titleTop: 'Compra sin',
    titleEm: 'perderte nada',
    body: 'Añade al carrito sin salir del live. Checkout en un toque, envío express y devoluciones gratis en toda Latam.',
    chips: [
      { kind: 'card',  label: 'Air Runner V2 · $89' },
      { kind: 'stock', label: 'Stock limitado · 12 unidades' },
      { kind: 'ship',  label: 'Checkout en 1 toque' },
    ],
  },
]

const CHIP_ICONS: Record<ChipKind, string> = {
  live: '●', trend: '↗', ship: '✦', chat: '💬', heart: '♥', 'chat-2': '💬', card: '🛍', stock: '⚡',
}
const CHIP_COLORS: Partial<Record<ChipKind, string>> = {
  live:  'var(--brand-400)',
  heart: 'var(--brand-400)',
  ship:  'var(--cyan-400)',
  trend: 'var(--violet-400)',
}

const PHONE_CONTENT  = [PhoneDiscover, PhoneChat, PhoneShop]
const DESKTOP_CHIPS  = [DesktopChipsDiscover, DesktopChipsChat, DesktopChipsShop]
const MOBILE_CHIPS   = [MobileChipsDiscover, MobileChipsChat, MobileChipsShop]

export function OnboardingSlides() {
  const [index, setIndex] = useState(0)
  const step  = STEPS[index]
  const total = STEPS.length

  function next() { if (index < total - 1) setIndex((i) => i + 1) }
  function back() { if (index > 0) setIndex((i) => i - 1) }

  const PhoneContent = PHONE_CONTENT[index]
  const DesktopChips = DESKTOP_CHIPS[index]
  const MobileChips  = MOBILE_CHIPS[index]

  return (
    <>
      <Ambient />

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col min-h-screen stage screen-enter" key={`desktop-${index}`}>
        <header className="flex items-center justify-between px-12 pt-10 pb-6 reveal d1">
          <BrandMark />
          <div className="flex items-center gap-4">
            <div className="live-badge">
              <span className="dot" />
              LIVE NOW · 12 streams
            </div>
            <Link href="/register" className="nav-link no-underline">
              Saltar →
            </Link>
          </div>
        </header>

        <div className="flex gap-12 items-center flex-1 px-12 pb-12">
          <div className="flex flex-col flex-1 max-w-xl">
            <div className="onb-step reveal d1">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <span className="bar" />
              <span>{step.eyebrow}</span>
            </div>
            <h1 className="display reveal d2 mb-6" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
              {step.titleTop}<br /><em>{step.titleEm}</em>
            </h1>
            <p className="lead reveal d3 text-[19px] max-w-[500px]">
              {step.body}
            </p>
            <div className="flex flex-col gap-3 mt-9 max-w-[460px] reveal d4">
              {step.chips.map((c, i) => (
                <FeatureRow key={i} kind={c.kind} label={c.label} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-(--line) reveal d5">
              <OnboardingProgress total={total} current={index} />
              <div className="flex items-center gap-4">
                <OnboardingNavigation current={index} total={total} onNext={next} onPrev={back} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center flex-1">
            <div className="relative flex items-center justify-center reveal d3">
              <DesktopChips />
              <div className="phone">
                <div className="screen">
                  <PhoneContent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter" key={`mobile-${index}`}>
        <div className="flex flex-col items-center min-h-screen px-6 pt-6 pb-8">
          <div className="flex items-center justify-between w-full mb-0">
            <BrandMark size={20} />
            <Link href="/register" className="nav-link no-underline text-[13px]">
              Saltar
            </Link>
          </div>

          <div className="w-full flex-1 flex flex-col justify-center pt-6">
            <div className="flex justify-center reveal d1">
              <div className="relative">
                <MobileChips />
                <div className="phone" style={{ height: 'clamp(280px, 42vh, 380px)', width: 'auto', aspectRatio: '9 / 19.5' }}>
                  <div className="screen overflow-hidden">
                    <div className="absolute inset-0" style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%', height: '182%' }}>
                      <PhoneContent />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 reveal d2">
              <div className="eyebrow mb-3">{step.eyebrow}</div>
              <h2 className="display text-[36px] leading-[1.05]">
                {step.titleTop}<br /><em>{step.titleEm}</em>
              </h2>
              <p className="lead mt-4 text-[15px]">{step.body}</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-6 items-center pt-6 reveal d3">
            <OnboardingProgress total={total} current={index} />
            <div className="w-full flex items-center justify-between gap-4">
              <OnboardingNavigation current={index} total={total} onNext={next} onPrev={back} stretch />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function FeatureRow({ kind, label }: { kind: ChipKind; label: string }) {
  const icon  = CHIP_ICONS[kind] || '·'
  const color = CHIP_COLORS[kind] || 'var(--ink-1)'
  return (
    <div
      className="flex items-center gap-3.5 py-3.5 px-4.5 rounded-[16px] backdrop-blur-[12px]"
      style={{ background: 'rgba(15,15,22,0.5)', border: '1px solid var(--line)' }}
    >
      <span
        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[14px] font-bold shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color }}
      >
        {icon}
      </span>
      <span className="text-[14px] text-(--ink-1)">{label}</span>
    </div>
  )
}
