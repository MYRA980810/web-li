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
      { kind: 'live', label: '12 streams en vivo ahora' },
      { kind: 'trend', label: '+340 productos nuevos hoy' },
      { kind: 'ship', label: 'Envío en 24h en 18 países' },
    ],
  },
  {
    eyebrow: 'Real-time chat',
    titleTop: 'Interactúa y',
    titleEm: 'participa',
    body: 'Chatea con el creador, envía reacciones y pregunta por tu talla, color o stock en tiempo real durante el live.',
    chips: [
      { kind: 'chat', label: '@alex_m · ¿Hay talla M?' },
      { kind: 'heart', label: '+248 reacciones esta hora' },
      { kind: 'chat-2', label: '@lucia_trend · ¡Me encanta!' },
    ],
  },
  {
    eyebrow: 'Smart shopping',
    titleTop: 'Compra sin',
    titleEm: 'perderte nada',
    body: 'Añade al carrito sin salir del live. Checkout en un toque, envío express y devoluciones gratis en toda Latam.',
    chips: [
      { kind: 'card', label: 'Air Runner V2 · $89' },
      { kind: 'stock', label: 'Stock limitado · 12 unidades' },
      { kind: 'ship', label: 'Checkout en 1 toque' },
    ],
  },
]

const CHIP_ICONS: Record<ChipKind, string> = {
  live: '●', trend: '↗', ship: '✦', chat: '💬', heart: '♥', 'chat-2': '💬', card: '🛍', stock: '⚡',
}
const CHIP_COLORS: Partial<Record<ChipKind, string>> = {
  live: 'var(--brand-400)',
  heart: 'var(--brand-400)',
  ship: 'var(--cyan-400)',
  trend: 'var(--violet-400)',
}

const PHONE_CONTENT = [PhoneDiscover, PhoneChat, PhoneShop]
const DESKTOP_CHIPS = [DesktopChipsDiscover, DesktopChipsChat, DesktopChipsShop]
const MOBILE_CHIPS = [MobileChipsDiscover, MobileChipsChat, MobileChipsShop]

export function OnboardingSlides() {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const total = STEPS.length

  function next() { if (index < total - 1) setIndex((i) => i + 1) }
  function back() { if (index > 0) setIndex((i) => i - 1) }

  const PhoneContent = PHONE_CONTENT[index]
  const DesktopChips = DESKTOP_CHIPS[index]
  const MobileChips = MOBILE_CHIPS[index]

  return (
    <>
      <Ambient />

      {/* ===== DESKTOP ===== */}
      <div className="onb-desktop stage screen-enter" key={`desktop-${index}`}>
        <header className="onb-header reveal d1">
          <BrandMark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="live-badge">
              <span className="dot" />
              LIVE NOW · 12 streams
            </div>
            <Link href="/register" className="nav-link" style={{ textDecoration: 'none' }}>
              Saltar →
            </Link>
          </div>
        </header>

        <div className="onb-grid">
          <div className="onb-copy">
            <div className="onb-step reveal d1">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <span className="bar" />
              <span>{step.eyebrow}</span>
            </div>
            <h1 className="display reveal d2" style={{ fontSize: 'clamp(48px, 6vw, 84px)', marginBottom: 24 }}>
              {step.titleTop}<br /><em>{step.titleEm}</em>
            </h1>
            <p className="lead reveal d3" style={{ fontSize: 19, maxWidth: 500 }}>
              {step.body}
            </p>
            <div className="reveal d4" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36, maxWidth: 460 }}>
              {step.chips.map((c, i) => (
                <FeatureRow key={i} kind={c.kind} label={c.label} />
              ))}
            </div>
            <div className="onb-nav-row reveal d5">
              <OnboardingProgress total={total} current={index} />
              <div className="onb-nav-actions">
                <OnboardingNavigation current={index} total={total} onNext={next} onPrev={back} />
              </div>
            </div>
          </div>

          <div className="splash-visual">
            <div className="phone-stage reveal d3">
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
      <div className="onb-mobile stage screen-enter" key={`mobile-${index}`}>
        <div className="splash-mobile-inner" style={{ paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <BrandMark size={20} />
            <Link href="/register" className="nav-link" style={{ textDecoration: 'none', fontSize: 13 }}>
              Saltar
            </Link>
          </div>

          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 24 }}>
            <div className="reveal d1" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <MobileChips />
                <div className="phone" style={{ height: 'clamp(280px, 42vh, 380px)', width: 'auto', aspectRatio: '9 / 19.5' }}>
                  <div className="screen" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%', height: '182%' }}>
                      <PhoneContent />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal d2" style={{ textAlign: 'center', marginTop: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{step.eyebrow}</div>
              <h2 className="display" style={{ fontSize: 36, lineHeight: 1.05 }}>
                {step.titleTop}<br /><em>{step.titleEm}</em>
              </h2>
              <p className="lead" style={{ marginTop: 16, fontSize: 15 }}>{step.body}</p>
            </div>
          </div>

          <div className="reveal d3" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', paddingTop: 24, paddingBottom: 32 }}>
            <OnboardingProgress total={total} current={index} />
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <OnboardingNavigation current={index} total={total} onNext={next} onPrev={back} stretch />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function FeatureRow({ kind, label }: { kind: ChipKind; label: string }) {
  const icon = CHIP_ICONS[kind] || '·'
  const color = CHIP_COLORS[kind] || 'var(--ink-1)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(15,15,22,0.5)', border: '1px solid var(--line)', borderRadius: 16, backdropFilter: 'blur(12px)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: 14, color: 'var(--ink-1)' }}>{label}</span>
    </div>
  )
}
