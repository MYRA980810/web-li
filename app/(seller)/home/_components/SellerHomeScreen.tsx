'use client'

import { Ambient } from '@/components/Ambient'

const NEWS_PROMOS = [
  {
    id: 'ar-filters',
    title: 'Nuevos Filtros AR para los Streams',
    tag: 'NUEVO',
    gradient: 'radial-gradient(ellipse at 30% 30%, #8b5cf6 0%, #4c1d95 55%, #120828 100%)',
  },
  {
    id: 'creative-pack',
    title: 'Pack Creative Pro disponible ya',
    tag: 'PROMO',
    gradient: 'radial-gradient(ellipse at 30% 30%, #ff1f87 0%, #7b0039 55%, #1a0010 100%)',
  },
]

const TOP_PRODUCTS = [
  { id: 'mac-classic',  name: 'Mac Classic',   emoji: '🎧', bg: 'radial-gradient(ellipse at 50% 40%, #0f0a2e, #08051a)', sales: '2.3k' },
  { id: 'sonic-pulse',  name: 'Sonic Pulse',   emoji: '🎤', bg: 'radial-gradient(ellipse at 50% 40%, #1a0530, #080215)', sales: '1.8k' },
  { id: 'stream-cam',   name: 'StreamCam X',   emoji: '📷', bg: 'radial-gradient(ellipse at 50% 40%, #0a1e2e, #050f1a)', sales: '1.2k' },
  { id: 'keystudio',    name: 'KeyStudio Pro', emoji: '⌨️', bg: 'radial-gradient(ellipse at 50% 40%, #0e1a0e, #070e07)', sales: '890' },
]

const RANKING = [
  { rank: 1, name: 'Elena Studio', handle: '@elenastudio', viewers: '12.4k', trend: '+18%', color: 'var(--brand-400)' },
  { rank: 2, name: 'TechVault',    handle: '@techvault',   viewers: '8.7k',  trend: '+9%',  color: 'var(--cyan-400)' },
  { rank: 3, name: 'Moda Express', handle: '@modaexpress', viewers: '6.2k',  trend: '+5%',  color: 'var(--violet-400)' },
]

const COMMUNITY_POST = {
  user: 'mariela_molina',
  avatar: 'M',
  text: 'El sistema de valoración mejoró un 40% mis ventas. Probá los nuevos filtros AR para tus streams — ¡son increíbles!',
  likes: 128,
  comments: 34,
  time: 'hace 2h',
}

const NAV_ITEMS = [
  { icon: '⌂', label: 'Inicio', active: true },
  { icon: '⊙', label: 'Explorar', active: false },
  { icon: null, label: 'Live', active: false, isLive: true },
  { icon: '◫', label: 'Stats', active: false },
  { icon: '◉', label: 'Perfil', active: false },
]

function BrandMark() {
  return (
    <span className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] text-[22px] leading-none [text-shadow:0_0_20px_rgba(255,31,135,0.5)]">
      ⚡ Livento
    </span>
  )
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-(--ink-0) flex items-center gap-2.5">
        {title}
        {badge && <span className="seller-location-badge">{badge}</span>}
      </span>
      <button className="text-[12px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors">
        Ver todo →
      </button>
    </div>
  )
}

function SellerHeroCard() {
  return (
    <div className="seller-hero-card">
      <div className="seller-hero-bg" />
      <div className="seller-hero-overlay" />
      <div className="seller-hero-body">
        <span className="eyebrow mb-2.5">Nuevo Lanzamiento</span>
        <h2 className="seller-hero-title">
          Nuevos Equipos<br />
          <em className="grad-text not-italic">Sonic Pulse</em>
        </h2>
        <p className="text-[13px] text-(--ink-2) leading-normal mt-1.5">
          Disponible para venta desde hoy · Stock limitado
        </p>
        <div className="flex gap-2.5 mt-4.5">
          <button className="live-launch-btn">Publicar ahora →</button>
          <button className="seller-ghost-sm">Ver detalles</button>
        </div>
      </div>
    </div>
  )
}

function NewsPromoGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {NEWS_PROMOS.map((item) => (
        <div key={item.id} className="seller-news-card">
          <div className="h-25 w-full" style={{ background: item.gradient }} />
          <div className="p-3 flex flex-col gap-2">
            <span className="seller-news-tag">{item.tag}</span>
            <p className="text-[13px] font-semibold text-(--ink-0) leading-snug">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TopProductsRow() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pt-1">
      {TOP_PRODUCTS.map((p) => (
        <div key={p.id} className="product-card shrink-0 w-35">
          <div className="relative h-30 flex items-center justify-center" style={{ background: p.bg }}>
            <span className="text-[32px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">{p.emoji}</span>
          </div>
          <div className="px-3 pb-3 pt-2 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-(--ink-1) leading-tight truncate">{p.name}</span>
            <span className="text-[11px] font-bold text-brand-400">{p.sales} ventas</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankingList() {
  return (
    <div className="flex flex-col mt-3">
      {RANKING.map((item) => (
        <div key={item.rank} className="flex items-center gap-3 py-3 border-b border-(--line)">
          <span
            className="text-[13px] font-bold font-display w-6 text-center shrink-0"
            style={{ color: item.rank === 1 ? 'var(--brand-400)' : 'var(--ink-3)' }}
          >
            #{item.rank}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-[#1a0612] shrink-0"
            style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
          >
            {item.name[0]}
          </div>
          <div className="flex flex-col flex-1 min-w-0 gap-0.5">
            <p className="text-[13px] font-semibold text-(--ink-0) truncate">{item.name}</p>
            <p className="text-[11px] text-(--ink-3)">{item.handle}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[13px] font-bold font-display text-(--ink-0) tracking-[-0.02em]">
              {item.viewers}
            </span>
            <span className="text-[10px] font-bold text-green-500 tracking-[0.04em]">
              {item.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommunityPost() {
  return (
    <div className="seller-community-card">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-full bg-grad-pink flex items-center justify-center text-[13px] font-bold text-[#1a0612] shrink-0">
          {COMMUNITY_POST.avatar}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-(--ink-0)">@{COMMUNITY_POST.user}</p>
          <p className="text-[11px] text-(--ink-3)">{COMMUNITY_POST.time}</p>
        </div>
      </div>
      <p className="text-[13px] text-(--ink-2) leading-relaxed">{COMMUNITY_POST.text}</p>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-(--line)">
        <button className="seller-community-action">♥ {COMMUNITY_POST.likes}</button>
        <button className="seller-community-action">◎ {COMMUNITY_POST.comments}</button>
      </div>
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) =>
        item.isLive ? (
          <button key="live" className="bottom-nav-live" aria-label="Live">⚡</button>
        ) : (
          <button
            key={item.label}
            className={`bottom-nav-item${item.active ? ' active' : ''}`}
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

export function SellerHomeScreen() {
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
          <SellerHeroCard />
        </div>

        <div className="px-5 mt-7 reveal d2">
          <SectionHeader title="Noticias & Promos" />
          <NewsPromoGrid />
        </div>

        <div className="px-5 mt-7 reveal d3">
          <SectionHeader title="Top Products" />
          <TopProductsRow />
        </div>

        <div className="px-5 mt-7 reveal d4">
          <SectionHeader title="Ranking Local" badge="Lima, Perú" />
          <RankingList />
        </div>

        <div className="px-5 mt-7 pb-2 reveal d5">
          <SectionHeader title="Comunidad" />
          <CommunityPost />
        </div>

        <BottomNav />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <BrandMark />
          <div className="flex items-center gap-2.5">
            <button className="home-nav-icon has-dot" aria-label="Notificaciones">🔔</button>
            <div className="w-9 h-9 rounded-full bg-grad-pink flex items-center justify-center font-bold text-[13px] text-[#1a0612] shrink-0">
              S
            </div>
          </div>
        </div>

        <div className="flex gap-8 px-12 py-8">
          <div className="flex flex-col gap-8 flex-1 min-w-0">
            <SellerHeroCard />
            <div>
              <SectionHeader title="Noticias & Promos" />
              <NewsPromoGrid />
            </div>
            <div>
              <SectionHeader title="Top Products" />
              <TopProductsRow />
            </div>
          </div>

          <div className="flex flex-col gap-8 w-80 shrink-0">
            <div>
              <SectionHeader title="Ranking Local" badge="Lima, Perú" />
              <RankingList />
            </div>
            <div>
              <SectionHeader title="Comunidad" />
              <CommunityPost />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
