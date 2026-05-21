import Link from 'next/link'
import { LiveStreamMock } from '@/components/LiveStreamMock'

type Props = {
  variant?: 'login' | 'register'
}

export function BrandSidePanel({ variant = 'login' }: Props) {
  return (
    <div className="auth-side reveal d1">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: 'var(--brand-500)',
              letterSpacing: '-0.02em',
              fontSize: 22,
              textShadow: '0 0 24px rgba(255,31,135,0.55)',
            }}
          >
            ⚡ Livento
          </span>
          <Link
            href="/splash"
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}
          >
            ← Volver
          </Link>
        </div>

        <div style={{ marginTop: 60 }}>
          <div className="live-badge" style={{ background: 'rgba(255,31,135,0.10)', border: '1px solid rgba(255,31,135,0.35)' }}>
            <span className="dot" />
            LIVE NOW · 12 streams
          </div>

          <h2 className="display" style={{ fontSize: 56, lineHeight: 1, marginTop: 24 }}>
            {variant === 'login' ? (
              <>Tu live<br /><em>te espera.</em></>
            ) : (
              <>Únete a la<br /><em>nueva era</em><br />del shopping.</>
            )}
          </h2>

          <p className="lead" style={{ marginTop: 20, fontSize: 16, maxWidth: 420 }}>
            {variant === 'login'
              ? 'Más de 12,400 creadores están vendiendo en vivo en este momento.'
              : 'Compra, vende e interactúa en tiempo real con los mejores creadores de Latam.'}
          </p>
        </div>

        <div style={{ marginTop: 40, width: 280, height: 380, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              overflow: 'hidden',
              border: '1px solid var(--line-strong)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 80px -20px rgba(255,31,135,0.3)',
            }}
          >
            <LiveStreamMock compact />
          </div>
          <div
            className="float-y delay-1"
            style={{
              position: 'absolute',
              right: -20,
              bottom: 60,
              padding: '10px 14px',
              background: 'rgba(15,15,22,0.85)',
              border: '1px solid var(--line-strong)',
              borderRadius: 14,
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#22d3ee,#0891b2)' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>@lucia_trend</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>1.2k viendo</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ValueRow icon="⚡" title="Live en tiempo real" body="Cero buffering, cero anuncios." />
          <ValueRow icon="🛍" title="Checkout en 1 toque" body="Sin salir del live." />
          <ValueRow icon="🌎" title="18 países en Latam" body="Envío express en 24h." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {[
                'linear-gradient(135deg,#22d3ee,#0891b2)',
                'linear-gradient(135deg,#ff66b8,#ff1f87)',
                'linear-gradient(135deg,#a78bfa,#6366f1)',
                'linear-gradient(135deg,#34d399,#059669)',
              ].map((bg, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: bg,
                    border: '2px solid var(--bg-0)',
                    marginLeft: i > 0 ? -8 : 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink-0)' }}>+12,400</strong> creadores activos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="value-row">
      <div className="icon-box">{icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-0)' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{body}</div>
      </div>
    </div>
  )
}
