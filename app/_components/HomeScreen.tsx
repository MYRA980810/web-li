'use client'

import { useState } from 'react'
import { Ambient } from '@/components/Ambient'

const CATEGORIES = ['En Vivo', 'Moda', 'Tecnología', 'Belleza', 'Gaming', 'Hogar']

const PRODUCTS = [
  {
    name: 'Sneakers Kinetic Red',
    price: '$51.00',
    emoji: '👟',
    bg: 'radial-gradient(ellipse at 50% 40%, #3d0a1e, #1a0510)',
    badge: 'HOT',
  },
  {
    name: 'Gafas Dark Retro',
    price: '$62.00',
    emoji: '🕶',
    bg: 'radial-gradient(ellipse at 50% 40%, #0f0a2e, #08051a)',
    badge: null,
  },
  {
    name: 'Auriculares Pro X',
    price: '$89.00',
    emoji: '🎧',
    bg: 'radial-gradient(ellipse at 50% 40%, #0a1e2e, #050f1a)',
    badge: null,
  },
  {
    name: 'Reloj Urban Steel',
    price: '$124.00',
    emoji: '⌚',
    bg: 'radial-gradient(ellipse at 50% 40%, #1a1a0e, #0e0e07)',
    badge: 'NUEVO',
  },
]

const NAV_ITEMS = [
  { icon: '⌂', label: 'Inicio', active: true },
  { icon: '⊙', label: 'Buscar', active: false },
  { icon: null, label: 'Live', active: false, isLive: true },
  { icon: '⊡', label: 'Bolsa', active: false },
  { icon: '◉', label: 'Perfil', active: false },
]

function BrandMark() {
  return (
    <span style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontStyle: 'italic',
      color: 'var(--brand-500)',
      letterSpacing: '-0.02em',
      fontSize: 22,
      lineHeight: 1,
      textShadow: '0 0 20px rgba(255,31,135,0.5)',
    }}>
      ⚡ Livento
    </span>
  )
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="home-section-header">
      <span className="home-section-title">{title}</span>
      <button className="home-see-all" onClick={onSeeAll}>Ver todo →</button>
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
        <span style={{ color: 'var(--ink-2)' }}>·</span>
        <span>1.2k</span>
      </div>

      <div className="live-hero-body">
        <h2 className="live-hero-title">
          Cosméticos de Neón:<br />
          <em style={{ fontStyle: 'normal', background: 'var(--grad-pink)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ¡Nueva Colección!
          </em>
        </h2>
        <div className="live-hero-footer">
          <div className="live-hero-creator">
            <div className="live-hero-avatar">E</div>
            <span className="live-hero-creator-name">Elena Olive</span>
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
    <div className="product-scroll">
      {PRODUCTS.map((p) => (
        <div key={p.name} className="product-card">
          <div className="product-card-image" style={{ background: p.bg }}>
            {p.badge && <span className="product-card-badge">{p.badge}</span>}
            <span style={{ fontSize: 36, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>
              {p.emoji}
            </span>
          </div>
          <div className="product-card-info">
            <span className="product-card-name">{p.name}</span>
            <span className="product-card-price">{p.price}</span>
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
        <em style={{ fontStyle: 'normal', background: 'var(--grad-pink)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Gran Drop
        </em>
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: -4 }}>
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
          <button key="live" className="bottom-nav-live" aria-label="Live">
            ⚡
          </button>
        ) : (
          <button
            key={item.label}
            className={`bottom-nav-item${item.label === active ? ' active' : ''}`}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
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
      <div className="home-mobile stage screen-enter">
        <div className="home-top-nav">
          <BrandMark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="home-nav-icon" aria-label="Buscar">⊙</button>
            <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
          </div>
        </div>

        <div className="home-categories reveal d1">
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

        <div className="home-section reveal d2">
          <SectionHeader title="Ahora mismo" />
          <LiveHeroCard />
        </div>

        <div className="home-section reveal d3" style={{ marginTop: 28 }}>
          <SectionHeader title="Recomendados para ti" />
        </div>
        <div className="reveal d3">
          <ProductRow />
        </div>

        <div className="home-section reveal d4" style={{ marginTop: 28 }}>
          <DropPromoCard />
        </div>

        <BottomNav active="Inicio" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="home-desktop stage screen-enter">
        <div className="home-desk-nav">
          <BrandMark />
          <div className="home-categories" style={{ padding: 0, flex: 1, justifyContent: 'center' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="home-nav-icon" aria-label="Buscar">⊙</button>
            <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#1a0612', flexShrink: 0 }}>
              U
            </div>
          </div>
        </div>

        <div className="home-desk-content">
          <div className="home-desk-feed">
            <div>
              <SectionHeader title="Ahora mismo" />
              <LiveHeroCard />
            </div>
            <div>
              <SectionHeader title="Recomendados para ti" />
              <div style={{ marginTop: 14 }}>
                <ProductRow />
              </div>
            </div>
          </div>

          <div className="home-desk-sidebar">
            <div>
              <SectionHeader title="Próximos drops" />
              <DropPromoCard />
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Streams activos</p>
              {[
                { name: '@lucia_trend', topic: 'Moda Otoño · Drop exclusivo', viewers: '1,248', color: 'var(--brand-400)' },
                { name: '@alex.tech', topic: 'Setup gamer · review en vivo', viewers: '3,420', color: 'var(--cyan-400)' },
                { name: '@maria_beauty', topic: 'K-beauty · ofertas', viewers: '2,108', color: 'var(--violet-400)' },
              ].map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-0)', marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.topic}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', flexShrink: 0 }}>{s.viewers}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
