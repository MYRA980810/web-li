import Link from 'next/link'
import { LiveStreamMock } from '@/components/LiveStreamMock'

type Props = {
  variant?: 'login' | 'register'
}

export function BrandSidePanel({ variant = 'login' }: Props) {
  return (
    <div className="auth-side reveal d1">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold italic text-brand-500 tracking-[-0.02em] text-[22px] [text-shadow:0_0_24px_rgba(255,31,135,0.55)]">
            ⚡ Livento
          </span>
          <Link
            href="/splash"
            className="btn-ghost no-underline py-2 px-4 text-[13px]"
          >
            ← Volver
          </Link>
        </div>

        <div className="mt-[60px]">
          <div className="live-badge" style={{ background: 'rgba(255,31,135,0.10)', border: '1px solid rgba(255,31,135,0.35)' }}>
            <span className="dot" />
            LIVE NOW · 12 streams
          </div>

          <h2 className="display text-[56px] leading-none mt-6">
            {variant === 'login' ? (
              <>Tu live<br /><em>te espera.</em></>
            ) : (
              <>Únete a la<br /><em>nueva era</em><br />del shopping.</>
            )}
          </h2>

          <p className="lead mt-5 text-[16px] max-w-[420px]">
            {variant === 'login'
              ? 'Más de 12,400 creadores están vendiendo en vivo en este momento.'
              : 'Compra, vende e interactúa en tiempo real con los mejores creadores de Latam.'}
          </p>
        </div>

        <div className="mt-10 w-[280px] h-[380px] relative">
          <div className="absolute inset-0 rounded-[28px] overflow-hidden border border-(--line-strong) shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(255,31,135,0.3)]">
            <LiveStreamMock compact />
          </div>
          <div
            className="float-y delay-1 absolute right-[-20px] bottom-[60px] flex items-center gap-2.5 py-2.5 px-3.5 rounded-[14px] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{ background: 'rgba(15,15,22,0.85)', border: '1px solid var(--line-strong)' }}
          >
            <div className="w-8 h-8 rounded-[10px]" style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)' }} />
            <div>
              <div className="text-[12px] font-bold">@lucia_trend</div>
              <div className="text-[10px] text-(--ink-3)">1.2k viendo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3.5">
          <ValueRow icon="⚡" title="Live en tiempo real" body="Cero buffering, cero anuncios." />
          <ValueRow icon="🛍" title="Checkout en 1 toque" body="Sin salir del live." />
          <ValueRow icon="🌎" title="18 países en Latam" body="Envío express en 24h." />
        </div>
        <div className="flex items-center gap-6 pt-5 border-t border-(--line)">
          <div className="flex items-center gap-2.5">
            <div className="flex">
              {[
                'linear-gradient(135deg,#22d3ee,#0891b2)',
                'linear-gradient(135deg,#ff66b8,#ff1f87)',
                'linear-gradient(135deg,#a78bfa,#6366f1)',
                'linear-gradient(135deg,#34d399,#059669)',
              ].map((bg, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-(--bg-0)"
                  style={{ background: bg, marginLeft: i > 0 ? -8 : 0 }}
                />
              ))}
            </div>
            <span className="text-[13px] text-(--ink-2)">
              <strong className="text-(--ink-0)">+12,400</strong> creadores activos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="value-row-icon">{icon}</div>
      <div>
        <div className="font-semibold text-[14px] text-(--ink-0)">{title}</div>
        <div className="text-[13px] text-(--ink-2) mt-0.5">{body}</div>
      </div>
    </div>
  )
}
