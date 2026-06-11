import type { Metadata } from 'next'
import Link from 'next/link'
import { Ambient } from '@/components/Ambient'
import { LiveStreamMock } from '@/components/LiveStreamMock'

export const metadata: Metadata = {
  title: 'Livento — La nueva era del shopping en vivo',
}

const TICKER_ITEMS = [
  ['@lucia_trend',  'Moda Otoño · Drop exclusivo',      '1,248'],
  ['@alex.tech',    'Setup gamer · review en vivo',      '3,420'],
  ['@maria_beauty', 'Skincare K-beauty · ofertas',       '2,108'],
  ['@kicks.studio', 'Sneaker drop · limited',            '5,872'],
  ['@homechef.mx',  'Cocina italiana · paso a paso',     '892'],
  ['@diego_fit',    'Ropa deportiva · liquidación',      '1,540'],
]

export default function SplashPage() {
  return (
    <>
      <Ambient />

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col min-h-screen px-12 py-8 stage screen-enter">
        <header className="splash-nav reveal d1">
          <BrandWordmark />
          <nav className="hidden xl:flex items-center gap-8">
            <span className="nav-link">Cómo funciona</span>
            <span className="nav-link">Para creadores</span>
            <span className="nav-link">Empresas</span>
            <span className="nav-link">Soporte</span>
          </nav>
          <div className="flex items-center gap-3 reveal d3">
            <Link href="/login" className="btn-ghost py-2.5 px-5 text-[14px] no-underline">
              Iniciar sesión
            </Link>
            <Link href="/onboarding" className="btn-pill py-3 px-6 text-[14px] no-underline">
              Empezar
            </Link>
          </div>
        </header>

        <div className="flex gap-12 items-center flex-1">
          <div className="flex flex-col flex-1 max-w-xl">
            <div className="reveal d1">
              <div className="live-badge" style={{ background: 'rgba(255,31,135,0.10)', border: '1px solid rgba(255,31,135,0.35)' }}>
                <span className="dot" />
                4,328 viendo ahora · 12 streams en vivo
              </div>
            </div>

            <h1 className="display reveal d2 mt-7" style={{ fontSize: 'clamp(56px, 7.5vw, 104px)' }}>
              La nueva era<br />
              del <em>shopping</em><br />
              <span className="text-(--ink-2) font-semibold tracking-[-0.025em]">en vivo.</span>
            </h1>

            <p className="lead reveal d3 text-[19px] max-w-[520px] mt-7">
              Descubre, interactúa y compra lo último en moda, tech y lifestyle
              directamente desde los mejores creadores de Latam. Sin esperas, sin
              anuncios, en tiempo real.
            </p>

            <div className="flex items-center gap-4 mt-10 reveal d4">
              <Link href="/onboarding" className="btn-pill no-underline">
                Entrar a Livento <span aria-hidden>→</span>
              </Link>
              <button className="btn-ghost">
                <span aria-hidden>▶</span> Ver demo · 90s
              </button>
            </div>

            <div className="reveal d5 mt-14">
              <AvatarRow />
            </div>

            <div className="flex items-center gap-8 mt-8 reveal d5">
              <Stat value="2.3M" label="Compradores activos" />
              <div className="w-px h-10 bg-(--line)" />
              <Stat value="$48M" label="GMV mensual" accent />
              <div className="w-px h-10 bg-(--line)" />
              <Stat value="18"   label="Países en Latam" />
            </div>
          </div>

          <div className="flex items-center justify-center flex-1">
            <div className="relative flex items-center justify-center reveal d3">
              <div className="chip float-pos chip-1 float-y">
                <div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)' }} />
                <span>
                  <strong>@lucia_trend</strong> está en vivo
                  <span className="text-(--ink-3) ml-1.5">· 1.2k</span>
                </span>
              </div>

              <div className="chip float-pos chip-2 float-y delay-1">
                <span className="text-[16px] text-brand-400">♥</span>
                <span><strong>+248</strong> reacciones</span>
              </div>

              <div className="chip float-pos chip-3 float-y delay-2">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500 shrink-0" style={{ boxShadow: '0 0 10px var(--brand-500)' }} />
                <span><strong>Air Runner V2</strong> · $89</span>
                <span className="text-brand-400 font-bold">+12 vendidos</span>
              </div>

              <div className="chip float-pos chip-4 float-y delay-1">
                <span className="text-[16px]">⚡</span>
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
              <div key={i} className="flex items-center gap-3 px-6">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                <strong>{who}</strong>
                <span className="text-(--ink-3)">·</span>
                <span className="text-(--ink-2)">{what}</span>
                <span className="text-brand-400 font-bold">{viewers} viendo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="flex flex-col items-center min-h-screen px-6 pt-10 pb-10 gap-8">
          <div className="self-start reveal d1">
            <div className="live-badge">
              <span className="dot" />
              v 2.4.0 · live tech
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 reveal d2">
            <BrandWordmark size={64} />
            <div className="text-center text-(--ink-2) text-[16px]">La nueva era del shopping</div>
          </div>

          <div className="relative flex items-center justify-center w-20 h-20 my-2 reveal d3">
            <div className="pulse-ring" />
            <div className="pulse-ring delay" />
            <div className="pulse-core" />
          </div>

          <Link
            href="/onboarding"
            className="flex flex-col items-center gap-1 font-display font-semibold text-[18px] text-(--ink-0) no-underline reveal d4"
          >
            <span>Toca para entrar</span>
            <span className="text-[18px] mt-1 text-brand-400">⌄</span>
          </Link>

          <div className="flex items-center gap-3 reveal d5">
            <div className="flex items-center gap-1.5">
              {['var(--brand-500)', 'var(--cyan-400)', 'var(--violet-400)'].map((c, i) => (
                <span key={i} className="inline-block w-2 h-2 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <div className="text-[10px] tracking-[0.12em] text-(--ink-3)">
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
      className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] leading-none block [text-shadow:0_0_24px_rgba(255,31,135,0.55)]"
      style={{ fontSize: size }}
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
    <div className="flex items-center gap-2.5">
      <div className="flex">
        {gradients.map((bg, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-(--bg-0)"
            style={{ background: bg, marginLeft: i > 0 ? -10 : 0 }}
          />
        ))}
      </div>
      <span className="text-[14px] text-(--ink-2)">
        <strong className="text-(--ink-0)">+12,400 creadores</strong> ya transmiten en Livento
      </span>
    </div>
  )
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        className={`font-display text-[32px] font-extrabold tracking-[-0.035em] leading-none${accent ? ' grad-text' : ' text-(--ink-0)'}`}
      >
        {value}
      </div>
      <div className="text-[13px] text-(--ink-3) mt-1">{label}</div>
    </div>
  )
}
