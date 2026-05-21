import { BrandMark } from '../../../_components/BrandMark'
import { ShopVisual } from '../visuals/ShopVisual'

export function PhoneShop() {
  return (
    <div className="absolute inset-0">
      <ShopVisual />
      <div className="absolute top-[60px] left-4.5 right-4.5 flex justify-between items-center">
        <BrandMark size={15} />
        <div className="px-2.5 py-[5px] rounded-full text-[9px] font-extrabold text-white tracking-[0.12em] inline-flex items-center gap-1.5 backdrop-blur-[8px]" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ▶ LIVE NOW
        </div>
      </div>
      <div className="absolute bottom-6 left-4.5 right-4.5 text-center">
        <div className="eyebrow mb-2">SMART SHOPPING</div>
        <div className="font-display font-bold text-2xl tracking-[-0.02em] leading-[1.05]">
          Compra sin<br />perderte nada
        </div>
        <div className="text-xs text-(--ink-2) mt-2.5 leading-relaxed">
          Checkout en un toque, sin interrumpir el live.
        </div>
      </div>
    </div>
  )
}

export function DesktopChipsShop() {
  return (
    <>
      <div className="chip float-pos chip-1 float-y">
        <span className="text-sm text-brand-400">●</span>
        <span><strong>12 vendidos</strong> en 2 min</span>
      </div>
      <div className="float-pos chip-2 float-y delay-1 p-2.5 rounded-2xl backdrop-blur-[20px] min-w-[180px]" style={{ background: 'rgba(15,15,22,0.8)', border: '1px solid rgba(255,31,135,0.3)', boxShadow: '0 10px 40px -10px rgba(255,31,135,0.4)' }}>
        <div className="text-[10px] font-extrabold tracking-[0.12em] text-brand-400">EN CARRITO</div>
        <div className="text-[13px] font-bold mt-1">Air Runner V2 · M</div>
        <div className="text-[11px] text-(--ink-3) mt-0.5">$89 · Envío 24h</div>
      </div>
      <div className="chip float-pos chip-3 float-y delay-2">
        <span className="text-sm text-(--cyan-400)">⚡</span>
        <span>Checkout en <strong>1 toque</strong></span>
      </div>
      <div className="chip float-pos chip-4 float-y delay-1">
        <span className="text-sm">↩</span>
        <span>Devolución <strong>gratis</strong></span>
      </div>
    </>
  )
}

export function MobileChipsShop() {
  return (
    <>
      <div className="mob-chip mob-chip-tl float-y">
        <span className="text-xs text-brand-400">●</span>
        <span><strong>12 vendidos</strong></span>
      </div>
      <div className="mob-chip mob-chip-mr float-y delay-1">
        <span className="text-xs text-(--cyan-400)">⚡</span>
        <span>1 toque</span>
      </div>
      <div className="mob-chip mob-chip-bl float-y delay-2">
        <span className="text-xs">↩</span>
        <span>Gratis</span>
      </div>
    </>
  )
}
