'use client'

import { Ambient } from '@/components/Ambient'
import { BuyerBottomNav } from '@/components/BuyerBottomNav'

const BUYER_NAME = 'Sofía'
const BUYER_LOCATION = 'Xalapa, Nayarit'

const LIVE_NOW = [
  { id: 'boutique-mar', store: 'Boutique Mar', product: 'Vestido midi lino', viewers: 214, bg: 'radial-gradient(ellipse at 50% 30%, #4a3420 0%, #1a1208 100%)' },
  { id: 'calzado-nayarit', store: 'Calzado Nayarit', product: 'Sandalias verano', viewers: 89, bg: 'radial-gradient(ellipse at 50% 30%, #e8e4de 0%, #a8a29a 100%)' },
  { id: 'casa-bella', store: 'Casa Bella', product: 'Velas aromáticas', viewers: 156, bg: 'radial-gradient(ellipse at 50% 30%, #3a1e2e 0%, #150a12 100%)' },
]

const UPCOMING_LIVES = [
  { id: 'jugueton', time: 'Hoy · 7:00 PM', store: 'Juguetón MX', desc: 'Nueva colección de peluches y ofertas 2x1', color: 'var(--brand-400)' },
  { id: 'glow', time: 'Mañana · 6:30 PM', store: 'Glow Cosmética', desc: 'Lanzamiento línea skincare', color: 'var(--violet-400)' },
]

const STORES_FOR_YOU = [
  { id: 'boutique-mar', name: 'Boutique Mar', color: 'var(--brand-400)' },
  { id: 'glow', name: 'Glow Cosmética', color: 'var(--violet-400)' },
  { id: 'jugueton', name: 'Juguetón MX', color: 'var(--cyan-400)' },
  { id: 'calzado-nayarit', name: 'Calzado Nay.', color: '#f59e0b' },
  { id: 'casa-bella', name: 'Casa Bella', color: 'var(--teal-400)' },
]

const DESTACADOS = [
  { id: 'vestido-lino', name: 'Vestido Midi Lino', price: '$45.00', emoji: '👗', bg: 'radial-gradient(ellipse at 50% 40%, #4a2e1a, #1f130a)', badge: 'HOT' },
  { id: 'sandalias', name: 'Sandalias Verano', price: '$28.00', emoji: '👡', bg: 'radial-gradient(ellipse at 50% 40%, #e8e4de, #a8a29a)', badge: null },
  { id: 'velas', name: 'Set Velas Aromáticas', price: '$19.00', emoji: '🕯️', bg: 'radial-gradient(ellipse at 50% 40%, #3a1e2e, #150a12)', badge: 'NUEVO' },
  { id: 'peluche', name: 'Peluche Osito XL', price: '$22.00', emoji: '🧸', bg: 'radial-gradient(ellipse at 50% 40%, #1a0e2e, #0a0515)', badge: null },
]

function BrandMark() {
  return (
    <span className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] text-[22px] leading-none [text-shadow:0_0_20px_rgba(255,31,135,0.5)]">
      ⚡ Livento
    </span>
  )
}

function BuyerGreeting() {
  return (
    <div className="flex items-start justify-between px-5 pt-5">
      <div>
        <h1 className="font-display font-extrabold text-[26px] leading-tight tracking-[-0.02em] text-(--ink-0)">
          Hola,<br />{BUYER_NAME}
        </h1>
        <p className="text-[12px] text-(--ink-3) mt-1">{BUYER_LOCATION}</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <button className="home-nav-icon" aria-label="Favoritos">🤍</button>
        <button className="home-nav-icon has-dot" aria-label="Compras">🛍</button>
      </div>
    </div>
  )
}

function SearchBar() {
  return (
    <button className="buyer-search-bar" aria-label="Buscar tiendas o productos">
      <span>🔍</span>
      <span>Buscar tiendas o productos</span>
    </button>
  )
}

function SectionHeader({ icon, title, action = 'Ver todo →' }: { icon?: string; title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-(--ink-0) flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </span>
      <button className="text-[12px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors">
        {action}
      </button>
    </div>
  )
}

function LiveNowPanel() {
  return (
    <div className="buyer-live-panel">
      <span className="eyebrow flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 [box-shadow:0_0_8px_var(--brand-500)]" />
        {LIVE_NOW.length} tiendas en vivo ahora
      </span>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {LIVE_NOW.map((item) => (
          <div key={item.id} className="product-card shrink-0 w-40">
            <div className="relative h-52" style={{ background: item.bg }}>
              <span className="absolute top-2.5 left-2.5 z-10 live-badge">
                <span className="dot" />
                Vivo
              </span>
              <span className="live-viewers-badge">👁 {item.viewers}</span>
              <div className="buyer-live-card-overlay" />
              <div className="buyer-live-card-body">
                <span className="text-[13px] font-bold text-(--ink-0) truncate">{item.store}</span>
                <span className="text-[11px] text-(--ink-2) truncate">{item.product}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpcomingLivesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {UPCOMING_LIVES.map((item) => (
        <div key={item.id} className="buyer-upcoming-card">
          <span className="buyer-upcoming-time">{item.time}</span>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full shrink-0"
              style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
            />
            <span className="text-[13px] font-bold text-(--ink-0) leading-tight">{item.store}</span>
          </div>
          <p className="text-[12px] text-(--ink-2) leading-snug">{item.desc}</p>
          <button className="buyer-notify-btn">Avisarme</button>
        </div>
      ))}
    </div>
  )
}

function StoresForYouRow() {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
      {STORES_FOR_YOU.map((store) => (
        <div key={store.id} className="flex flex-col items-center gap-2 shrink-0 w-18">
          <div
            className="buyer-store-avatar"
            style={{ background: store.color, boxShadow: `0 0 14px ${store.color}` }}
          >
            {store.name[0]}
          </div>
          <span className="text-[11px] text-(--ink-2) text-center leading-tight">{store.name}</span>
        </div>
      ))}
    </div>
  )
}

function DestacadosRow() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pt-1">
      {DESTACADOS.map((p) => (
        <div key={p.id} className="product-card shrink-0 w-35">
          <div className="relative h-30 flex items-center justify-center" style={{ background: p.bg }}>
            {p.badge && <span className="product-card-badge">{p.badge}</span>}
            <span className="text-[32px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">{p.emoji}</span>
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

export function BuyerHomeScreen() {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <BuyerGreeting />

        <div className="px-5 mt-5 reveal d1">
          <SearchBar />
        </div>

        <div className="px-5 mt-6 reveal d2">
          <LiveNowPanel />
        </div>

        <div className="px-5 mt-7 reveal d3">
          <SectionHeader icon="📅" title="Próximos lives" action="Ver todos →" />
          <UpcomingLivesGrid />
        </div>

        <div className="px-5 mt-7 reveal d4">
          <SectionHeader icon="🏪" title="Tiendas para ti" action="Explorar →" />
          <div className="mt-1">
            <StoresForYouRow />
          </div>
        </div>

        <div className="px-5 mt-7 pb-2 reveal d5">
          <SectionHeader icon="✨" title="Destacados" action="Ver más →" />
          <DestacadosRow />
        </div>

        <BuyerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <BrandMark />
          <div className="flex items-center gap-2.5">
            <button className="home-nav-icon" aria-label="Favoritos">🤍</button>
            <button className="home-nav-icon has-dot" aria-label="Compras">🛍</button>
            <div className="w-9 h-9 rounded-full bg-grad-pink flex items-center justify-center font-bold text-[13px] text-[#1a0612] shrink-0">
              {BUYER_NAME[0]}
            </div>
          </div>
        </div>

        <div className="flex gap-8 px-12 py-8">
          <div className="flex flex-col gap-8 flex-1 min-w-0">
            <div>
              <h1 className="font-display font-extrabold text-[26px] tracking-[-0.02em] text-(--ink-0)">
                Hola, {BUYER_NAME}
              </h1>
              <p className="text-[12px] text-(--ink-3) mt-1">{BUYER_LOCATION}</p>
            </div>
            <SearchBar />
            <LiveNowPanel />
            <div>
              <SectionHeader icon="✨" title="Destacados" action="Ver más →" />
              <DestacadosRow />
            </div>
          </div>

          <div className="flex flex-col gap-8 w-80 shrink-0">
            <div>
              <SectionHeader icon="📅" title="Próximos lives" action="Ver todos →" />
              <div className="flex flex-col gap-3 mt-3">
                {UPCOMING_LIVES.map((item) => (
                  <div key={item.id} className="buyer-upcoming-card">
                    <span className="buyer-upcoming-time">{item.time}</span>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-full shrink-0"
                        style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}
                      />
                      <span className="text-[13px] font-bold text-(--ink-0) leading-tight">{item.store}</span>
                    </div>
                    <p className="text-[12px] text-(--ink-2) leading-snug">{item.desc}</p>
                    <button className="buyer-notify-btn">Avisarme</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader icon="🏪" title="Tiendas para ti" action="Explorar →" />
              <div className="mt-1">
                <StoresForYouRow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
