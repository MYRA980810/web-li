'use client'

import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

const FEATURES = [
  {
    id: 'inventory',
    icon: '📦',
    title: 'Gestioná tu Inventario',
    desc: 'Organizá tus productos con herramientas profesionales diseñadas para vendedores.',
  },
  {
    id: 'sales',
    icon: '📊',
    title: 'Seguí Cada Venta',
    desc: 'Entendé a tus clientes y optimizá tus resultados de ventas.',
  },
  {
    id: 'reach',
    icon: '🌐',
    title: 'Alcanzá Millones',
    desc: 'Conectate con compradores al instante a través de nuestro potente marketplace.',
  },
]

function BrandMark() {
  return (
    <span className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] text-[22px] leading-none [text-shadow:0_0_20px_rgba(255,31,135,0.5)]">
      ⚡ Livento
    </span>
  )
}

function WelcomeHero() {
  return (
    <div className="store-welcome-hero">
      <div className="store-welcome-hero-bg" />
      <div className="relative z-10 flex flex-col items-center gap-4 py-10">
        <div className="flex items-end gap-5">
          <span className="text-[40px] float-y delay-1 drop-shadow-[0_0_20px_rgba(139,92,246,0.7)]">📦</span>
          <span className="text-[52px] float-y drop-shadow-[0_0_28px_rgba(255,31,135,0.8)]">🛍</span>
          <span className="text-[40px] float-y delay-2 drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]">📊</span>
        </div>
        <div className="w-24 h-px bg-brand-400 opacity-40" />
      </div>
    </div>
  )
}

function FeatureList() {
  return (
    <div>
      {FEATURES.map((f) => (
        <div key={f.id} className="store-feature-item">
          <div className="store-feature-icon-wrap">
            <span>{f.icon}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] font-semibold text-(--ink-0) leading-tight">{f.title}</p>
            <p className="text-[12px] text-(--ink-3) leading-relaxed">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SellerStoreWelcome() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="home-top-nav">
          <BrandMark />
          <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
        </div>

        <div className="px-5 mt-5 reveal d1">
          <span className="eyebrow">¿Listo para tu propia aventura?</span>
          <h1 className="font-display font-extrabold text-[32px] leading-[1.05] tracking-[-0.03em] text-(--ink-0) mt-3">
            Bienvenido a<br />
            <em className="grad-text not-italic">Tu Tienda</em>
          </h1>
        </div>

        <div className="px-5 mt-5 reveal d2">
          <WelcomeHero />
        </div>

        <div className="px-5 mt-4 reveal d3">
          <FeatureList />
        </div>

        <div className="px-5 mt-6 pb-2 reveal d4">
          <Link
            href="/store/setup"
            className="live-launch-btn w-full justify-center text-[14px]"
          >
            Empezar →
          </Link>
        </div>

        <SellerBottomNav active="store" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <BrandMark />
          <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
        </div>

        <div className="flex items-center justify-center py-16 px-8">
          <div className="flex flex-col gap-8 w-full max-w-md">
            <div>
              <span className="eyebrow">¿Listo para tu propia aventura?</span>
              <h1 className="font-display font-extrabold text-[40px] leading-[1.05] tracking-[-0.03em] text-(--ink-0) mt-3">
                Bienvenido a<br />
                <em className="grad-text not-italic">Tu Tienda</em>
              </h1>
            </div>

            <WelcomeHero />
            <FeatureList />

            <Link
              href="/store/setup"
              className="live-launch-btn justify-center text-[14px]"
            >
              Empezar →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
