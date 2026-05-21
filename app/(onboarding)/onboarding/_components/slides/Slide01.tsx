import { LiveStreamMock } from '@/components/LiveStreamMock'
import { BrandMark } from '../../../_components/BrandMark'

export function PhoneDiscover() {
  return (
    <div className="absolute inset-0 pt-15 px-4.5 pb-6 flex flex-col">
      <div className="self-start mb-3.5">
        <BrandMark size={15} />
      </div>
      <div className="relative flex-1 slide-discover-stream">
        <LiveStreamMock />
        <div className="absolute -bottom-4.5 -left-3 slide-discover-product">
          <div className="absolute -top-2 left-3 px-2.5 py-0.75 rounded-full text-[9px] font-extrabold text-[#1a0612] tracking-[0.08em] bg-grad-pink">
            NEW
          </div>
        </div>
      </div>
      <div className="mt-7">
        <div className="font-display font-bold text-[22px] tracking-[-0.02em] leading-[1.05]">
          Descubre lo mejor<br />
          <em className="grad-text not-italic">en vivo</em>
        </div>
        <div className="text-xs text-(--ink-2) mt-2.5 leading-relaxed">
          Las últimas tendencias en moda, tech y lifestyle.
        </div>
      </div>
    </div>
  )
}

export function DesktopChipsDiscover() {
  return (
    <>
      <div className="chip float-pos chip-1 float-y">
        <div className="size-6 rounded-full shrink-0 bg-[linear-gradient(135deg,#ff66b8,#ff1f87)]" />
        <span><strong>@maria_beauty</strong> · 2.1k</span>
        <div className="live-badge" style={{ padding: '2px 8px', fontSize: 9 }}><span className="dot" />LIVE</div>
      </div>
      <div className="chip float-pos chip-2 float-y delay-1">
        <span className="text-lg">↗</span>
        <span><strong>+340</strong> productos hoy</span>
      </div>
      <div className="float-pos chip-3 float-y delay-2 p-2 flex items-center gap-2.5 rounded-2xl backdrop-blur-[20px]" style={{ background: 'rgba(15,15,22,0.8)', border: '1px solid var(--line)' }}>
        <div className="size-11 rounded-[10px] bg-[radial-gradient(ellipse_at_30%_30%,#ff4d8a,#8a0a3e_60%,#2a050f_100%)]" />
        <div>
          <div className="text-[11px] text-(--ink-3)">NUEVO</div>
          <div className="text-[13px] font-bold">Air Runner V2</div>
        </div>
      </div>
      <div className="chip float-pos chip-4 float-y delay-1">
        <span className="text-sm text-(--cyan-400)">✦</span>
        <span>Envío en <strong>24h</strong></span>
      </div>
    </>
  )
}

export function MobileChipsDiscover() {
  return (
    <>
      <div className="mob-chip mob-chip-tl float-y">
        <div className="size-4 rounded-full shrink-0 bg-[linear-gradient(135deg,#ff66b8,#ff1f87)]" />
        <span><strong>@maria_beauty</strong></span>
        <div className="live-badge" style={{ padding: '1px 6px', fontSize: 8 }}><span className="dot" />LIVE</div>
      </div>
      <div className="mob-chip mob-chip-mr float-y delay-1">
        <span className="text-[13px]">↗</span>
        <span><strong>+340</strong> hoy</span>
      </div>
      <div className="mob-chip mob-chip-bl float-y delay-2">
        <span className="text-[11px] text-(--cyan-400)">✦</span>
        <span>Envío <strong>24h</strong></span>
      </div>
    </>
  )
}
