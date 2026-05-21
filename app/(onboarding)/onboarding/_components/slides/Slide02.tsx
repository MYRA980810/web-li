import { BrandMark } from '../../../_components/BrandMark'
import { ChatVisual } from '../visuals/ChatVisual'

export function PhoneChat() {
  return (
    <div className="absolute inset-0 pt-15 px-4.5 pb-6 flex flex-col">
      <div className="flex justify-between items-center mb-3.5">
        <BrandMark size={15} />
        <div className="size-9 rounded-full flex items-center justify-center text-sm text-brand-400" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,31,135,0.4)' }}>
          💬
        </div>
      </div>
      <div className="relative flex-1 rounded-[22px] overflow-hidden chat-bg" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <ChatVisual />
      </div>
      <div className="mt-6">
        <div className="live-badge inline-flex mb-3.5">
          <span className="dot" />LIVE NOW
        </div>
        <div className="font-display font-bold text-[22px] tracking-[-0.02em] leading-[1.1] mt-3">
          Interactúa y participa
        </div>
        <div className="text-xs text-(--ink-2) mt-2 leading-relaxed">
          Chatea en tiempo real con el vendedor.
        </div>
      </div>
    </div>
  )
}

export function DesktopChipsChat() {
  return (
    <>
      <div className="float-pos chip-1 float-y flex items-center gap-2 rounded-2xl p-[8px_12px] backdrop-blur-[20px]" style={{ background: 'rgba(15,15,22,0.8)', border: '1px solid var(--line)' }}>
        <div className="size-5 rounded-full shrink-0 bg-(--cyan-400)" />
        <div>
          <div className="text-[9px] font-bold text-(--cyan-400)">@alex_m</div>
          <div className="text-[11px]">¿Tienen talla M? 😍</div>
        </div>
      </div>
      <div className="chip float-pos chip-2 float-y delay-1">
        <span className="text-brand-400 text-base">♥</span>
        <span><strong>+248</strong> reacciones</span>
      </div>
      <div className="float-pos chip-3 float-y delay-2 flex items-center gap-2 rounded-2xl p-[8px_12px] backdrop-blur-[20px]" style={{ background: 'rgba(15,15,22,0.8)', border: '1px solid var(--line)' }}>
        <div className="size-5 rounded-full shrink-0 bg-brand-400" />
        <div>
          <div className="text-[9px] font-bold text-brand-400">@lucia_trend</div>
          <div className="text-[11px]">¡Me encanta el color!</div>
        </div>
      </div>
      <div className="chip float-pos chip-4 float-y delay-1">
        <div className="size-6 rounded-full shrink-0 bg-[linear-gradient(135deg,#a78bfa,#6366f1)]" />
        <span><strong>@diego_fit</strong> respondió</span>
      </div>
    </>
  )
}

export function MobileChipsChat() {
  return (
    <>
      <div className="mob-chip mob-chip-tl float-y">
        <div className="size-4 rounded-full shrink-0 bg-(--cyan-400)" />
        <span><strong>@alex_m</strong> · talla M?</span>
      </div>
      <div className="mob-chip mob-chip-mr float-y delay-1">
        <span className="text-brand-400 text-sm">♥</span>
        <span><strong>+248</strong></span>
      </div>
      <div className="mob-chip mob-chip-bl float-y delay-2">
        <div className="size-4 rounded-full shrink-0 bg-brand-400" />
        <span><strong>@lucia</strong> · genial!</span>
      </div>
    </>
  )
}
