'use client'

import { useState } from 'react'
import { Ambient } from '@/components/Ambient'

const CATEGORIES = ['En Vivo', 'Moda', 'Tecnología', 'Belleza', 'Gaming', 'Hogar']

const PRODUCTS = [
  { name: 'Sneakers Kinetic Red', price: '$51.00', emoji: '👟', bg: 'radial-gradient(ellipse at 50% 40%, #3d0a1e, #1a0510)', badge: 'HOT' },
  { name: 'Gafas Dark Retro',     price: '$62.00', emoji: '🕶',  bg: 'radial-gradient(ellipse at 50% 40%, #0f0a2e, #08051a)', badge: null },
  { name: 'Auriculares Pro X',    price: '$89.00', emoji: '🎧', bg: 'radial-gradient(ellipse at 50% 40%, #0a1e2e, #050f1a)', badge: null },
  { name: 'Reloj Urban Steel',    price: '$124.00', emoji: '⌚', bg: 'radial-gradient(ellipse at 50% 40%, #1a1a0e, #0e0e07)', badge: 'NUEVO' },
]

const NAV_ITEMS = [
  { icon: '⌂', label: 'Inicio', active: true },
  { icon: '⊙', label: 'Buscar', active: false },
  { icon: null, label: 'Live', active: false, isLive: true },
  { icon: '⊡', label: 'Bolsa', active: false },
  { icon: '◉', label: 'Perfil', active: false },
]

const ACTIVE_STREAMS = [
  { name: '@lucia_trend', topic: 'Moda Otoño · Drop exclusivo', viewers: '1,248', color: 'var(--brand-400)' },
  { name: '@alex.tech',   topic: 'Setup gamer · review en vivo', viewers: '3,420', color: 'var(--cyan-400)' },
  { name: '@maria_beauty', topic: 'K-beauty · ofertas',          viewers: '2,108', color: 'var(--violet-400)' },
]

function BrandMark() {
  return (
    <span className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] text-[22px] leading-none [text-shadow:0_0_20px_rgba(255,31,135,0.5)]">
      ⚡ Livento
    </span>
  )
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-(--ink-0)">{title}</span>
      <button className="text-[12px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors" onClick={onSeeAll}>
        Ver todo →
      </button>
    </div>
  )
}

function LiveHeroCard() {
  return (
    <div className="live-hero-card">
      <div className="live-hero-image" />
      <div className="live-hero-figure" />
      <div className="live-hero-overlay" />
      <span className="live-hero-eyebrow">Beauty Month</span>
      <div className="live-viewers-badge">
        <span className="live-badge" style={{ padding: 0, background: 'none', border: 'none', gap: 4 }}>
          <span className="dot" />
          LIVE
        </span>
        <span className="text-(--ink-2)">·</span>
        <span>1.2k</span>
      </div>
      <div className="relative z-10 p-5">
        <h2 className="font-display font-extrabold text-[26px] tracking-[-0.03em] leading-[1.05] text-(--ink-0) mb-3">
          Cosméticos de Neón:<br />
          <em className="grad-text not-italic">¡Nueva Colección!</em>
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-grad-pink flex items-center justify-center text-[13px] font-bold text-[#1a0612] shrink-0">
              E
            </div>
            <span className="text-[13px] font-semibold text-(--ink-1)">Elena Olive</span>
          </div>
          <button className="live-launch-btn">
            Lanzar <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductRow() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-4 pt-1">
      {PRODUCTS.map((p) => (
        <div key={p.name} className="product-card shrink-0 w-[140px]">
          <div className="relative h-[120px] flex items-center justify-center" style={{ background: p.bg }}>
            {p.badge && <span className="product-card-badge">{p.badge}</span>}
            <span className="text-[36px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">{p.emoji}</span>
          </div>
          <div className="px-3 pb-3 pt-2 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-(--ink-1) leading-tight truncate">{p.name}</span>
            <span className="text-[12px] font-bold text-brand-400">{p.price}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function DropPromoCard() {
  return (
    <div className="drop-promo-card">
      <div className="drop-promo-glow" />
      <div>
        <span className="drop-promo-eyebrow">
          <span>⚡</span>
          Mañana · 08:00 PM
        </span>
      </div>
      <p className="drop-promo-title">
        El Próximo<br />
        <em className="grad-text not-italic">Gran Drop</em>
      </p>
      <p className="text-[13px] text-(--ink-2) leading-[1.55] -mt-1">
        Moda otoño · Drop exclusivo con Mariana Style. Precio especial para early birds.
      </p>
      <button className="drop-notify-btn">
        <span>🔔</span> Notifícame
      </button>
    </div>
  )
}

function BottomNav({ active }: { active: string }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.isLive ? (
          <button key="live" className="bottom-nav-live" aria-label="Live">⚡</button>
        ) : (
          <button
            key={item.label}
            className={`bottom-nav-item${item.label === active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.12em]">{item.label}</span>
          </button>
        )
      )}
    </nav>
  )
}

export function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('En Vivo')

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="home-top-nav">
          <BrandMark />
          <div className="flex items-center gap-2">
            <button className="home-nav-icon" aria-label="Buscar">⊙</button>
            <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 py-3 reveal d1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill${cat === activeCategory ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'En Vivo' && cat === activeCategory && <span className="live-dot" />}
              {cat}
            </button>
          ))}
        </div>

        <div className="px-5 reveal d2">
          <SectionHeader title="Ahora mismo" />
          <LiveHeroCard />
        </div>

        <div className="px-5 mt-7 reveal d3">
          <SectionHeader title="Recomendados para ti" />
        </div>
        <div className="reveal d3">
          <ProductRow />
        </div>

        <div className="px-5 mt-7 reveal d4">
          <DropPromoCard />
        </div>

        <BottomNav active="Inicio" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <BrandMark />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 justify-center px-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill${cat === activeCategory ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'En Vivo' && cat === activeCategory && <span className="live-dot" />}
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <button className="home-nav-icon" aria-label="Buscar">⊙</button>
            <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
            <div className="w-9 h-9 rounded-full bg-grad-pink flex items-center justify-center font-bold text-[13px] text-[#1a0612] shrink-0">
              U
            </div>
          </div>
        </div>

        <div className="flex gap-8 px-12 py-8">
          <div className="flex flex-col gap-8 flex-1 min-w-0">
            <div>
              <SectionHeader title="Ahora mismo" />
              <LiveHeroCard />
            </div>
            <div>
              <SectionHeader title="Recomendados para ti" />
              <div className="mt-3.5">
                <ProductRow />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-80 shrink-0">
            <div>
              <SectionHeader title="Próximos drops" />
              <DropPromoCard />
            </div>
            <div className="p-4 rounded-(--r-lg) border border-(--line)" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="eyebrow mb-3">Streams activos</p>
              {ACTIVE_STREAMS.map((s) => (
                <div key={s.name} className="flex items-center gap-3 py-2.5 border-b border-(--line)">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-(--ink-0) mb-0.5">{s.name}</p>
                    <p className="text-[11px] text-(--ink-3) truncate">{s.topic}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-(--ink-2) shrink-0">{s.viewers}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
