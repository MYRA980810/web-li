import type { Metadata } from 'next'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { LiveStreamMock } from '@/components/LiveStreamMock'

export const metadata: Metadata = {
  title: 'Livento — La nueva era del shopping en vivo',
}

const TICKER_ITEMS = [
  ['@lucia_trend', 'Moda Otoño · Drop exclusivo', '1,248'],
  ['@alex.tech', 'Setup gamer · review en vivo', '3,420'],
  ['@maria_beauty', 'Skincare K-beauty · ofertas', '2,108'],
  ['@kicks.studio', 'Sneaker drop · limited', '5,872'],
  ['@homechef.mx', 'Cocina italiana · paso a paso', '892'],
  ['@diego_fit', 'Ropa deportiva · liquidación', '1,540'],
]

export default function SplashPage() {
  return (
    <>
      <Ambient />

      {/* ===== DESKTOP ===== */}
      <div className="splash-desktop stage screen-enter">
        <header className="splash-nav">
          <div className="reveal d1">
            <BrandWordmark />
          </div>
          <nav className="splash-nav-links reveal d2">
            <span className="nav-link">Cómo funciona</span>
            <span className="nav-link">Para creadores</span>
            <span className="nav-link">Empresas</span>
            <span className="nav-link">Soporte</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="reveal d3">
            <Link href="/login" className="btn-ghost" style={{ padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link href="/onboarding" className="btn-pill" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}>
              Empezar
            </Link>
          </div>
        </header>

        <div className="splash-grid">
          <div className="splash-copy">
            <div className="splash-pill reveal d1">
              <div className="live-badge" style={{ background: 'rgba(255,31,135,0.10)', border: '1px solid rgba(255,31,135,0.35)' }}>
                <span className="dot" />
                4,328 viendo ahora · 12 streams en vivo
              </div>
            </div>

            <h1 className="display reveal d2" style={{ fontSize: 'clamp(56px, 7.5vw, 104px)', marginTop: 28 }}>
              La nueva era<br />
              del <em>shopping</em><br />
              <span style={{ color: 'var(--ink-2)', fontWeight: 600, letterSpacing: '-0.025em' }}>en vivo.</span>
            </h1>

            <p className="lead reveal d3" style={{ fontSize: 19, maxWidth: 520, marginTop: 28 }}>
              Descubre, interactúa y compra lo último en moda, tech y lifestyle
              directamente desde los mejores creadores de Latam. Sin esperas, sin
              anuncios, en tiempo real.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40 }} className="reveal d4">
              <Link href="/onboarding" className="btn-pill" style={{ textDecoration: 'none' }}>
                Entrar a Livento <span aria-hidden>→</span>
              </Link>
              <button className="btn-ghost">
                <span aria-hidden>▶</span> Ver demo · 90s
              </button>
            </div>

            <div className="reveal d5" style={{ marginTop: 56 }}>
              <AvatarRow />
            </div>

            <div className="splash-stats reveal d5">
              <Stat value="2.3M" label="Compradores activos" />
              <div className="stats-divider" />
              <Stat value="$48M" label="GMV mensual" accent />
              <div className="stats-divider" />
              <Stat value="18" label="Países en Latam" />
            </div>
          </div>

          <div className="splash-visual">
            <div className="phone-stage reveal d3">
              <div className="chip float-pos chip-1 float-y">
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#0891b2)', flexShrink: 0 }} />
                <span>
                  <strong>@lucia_trend</strong> está en vivo
                  <span style={{ color: 'var(--ink-3)', marginLeft: 6 }}>· 1.2k</span>
                </span>
              </div>

              <div className="chip float-pos chip-2 float-y delay-1">
                <span style={{ fontSize: 16, color: 'var(--brand-400)' }}>♥</span>
                <span><strong>+248</strong> reacciones</span>
              </div>

              <div className="chip float-pos chip-3 float-y delay-2">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)', boxShadow: '0 0 10px var(--brand-500)', flexShrink: 0, display: 'inline-block' }} />
                <span><strong>Air Runner V2</strong> · $89</span>
                <span style={{ color: 'var(--brand-400)', fontWeight: 700 }}>+12 vendidos</span>
              </div>

              <div className="chip float-pos chip-4 float-y delay-1">
                <span style={{ fontSize: 16 }}>⚡</span>
                <span>Envío en <strong>24h</strong></span>
              </div>

              <div className="phone">
                <div className="screen">
                  <LiveStreamMock />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="splash-ticker">
          <div className="ticker">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map(([who, what, viewers], i) => (
              <div key={i} className="ticker-item">
                <span className="live-dot" />
                <strong>{who}</strong>
                <span style={{ color: 'var(--ink-3)' }}>·</span>
                <span style={{ color: 'var(--ink-2)' }}>{what}</span>
                <span style={{ color: 'var(--brand-400)', fontWeight: 700 }}>{viewers} viendo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="splash-mobile stage screen-enter">
        <div className="splash-mobile-inner">
          <div className="reveal d1" style={{ alignSelf: 'flex-start' }}>
            <div className="live-badge">
              <span className="dot" />
              v 2.4.0 · live tech
            </div>
          </div>

          <div className="splash-mobile-hero reveal d2">
            <BrandWordmark size={64} />
            <div className="splash-mobile-tagline">La nueva era del shopping</div>
          </div>

          <div className="splash-mobile-pulse reveal d3">
            <div className="pulse-ring" />
            <div className="pulse-ring delay" />
            <div className="pulse-core" />
          </div>

          <Link href="/onboarding" className="splash-mobile-cta reveal d4" style={{ textDecoration: 'none' }}>
            <span>Toca para entrar</span>
            <span style={{ fontSize: 18, marginTop: 4, color: 'var(--brand-400)' }}>⌄</span>
          </Link>

          <div className="splash-mobile-footer reveal d5">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {['var(--brand-500)', 'var(--cyan-400)', 'var(--violet-400)'].map((c, i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
              ))}
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
              V. 2.4.0 · LIVE TECH
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function BrandWordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontStyle: 'italic',
        color: 'var(--brand-500)',
        letterSpacing: '-0.02em',
        fontSize: size,
        lineHeight: 1,
        textShadow: '0 0 24px rgba(255,31,135,0.55)',
        display: 'block',
      }}
    >
      ⚡ Livento
    </span>
  )
}

function AvatarRow() {
  const gradients = [
    'linear-gradient(135deg,#22d3ee,#0891b2)',
    'linear-gradient(135deg,#ff66b8,#ff1f87)',
    'linear-gradient(135deg,#a78bfa,#6366f1)',
    'linear-gradient(135deg,#34d399,#059669)',
    'linear-gradient(135deg,#fb923c,#f59e0b)',
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex' }}>
        {gradients.map((bg, i) => (
          <div
            key={i}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: bg,
              border: '2px solid var(--bg-0)',
              marginLeft: i > 0 ? -10 : 0,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>
        <strong style={{ color: 'var(--ink-0)' }}>+12,400 creadores</strong> ya transmiten en Livento
      </span>
    </div>
  )
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1,
          ...(accent
            ? { background: 'var(--grad-pink)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }
            : { color: 'var(--ink-0)' }),
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{label}</div>
    </div>
  )
}
