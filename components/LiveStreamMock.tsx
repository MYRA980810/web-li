export function LiveStreamMock({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'block' }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse at 60% 35%, #c47090 0%, transparent 45%), radial-gradient(ellipse at 20% 70%, #4a3a5a 0%, transparent 50%), linear-gradient(180deg, #1a0a1c 0%, #0a0510 100%)',
      }} />

      {/* Abstract figure */}
      <div style={{
        position: 'absolute',
        left: '30%', top: '20%',
        width: '55%', height: '55%',
        background: 'radial-gradient(ellipse at 50% 35%, #e8b8a4 0%, #c08570 30%, #6a3d3a 60%, #2a1818 100%)',
        borderRadius: '45% 45% 40% 40% / 55% 55% 45% 45%',
        filter: 'blur(2px)',
        opacity: 0.9,
      }} />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 60%, rgba(5,2,7,0.95) 100%)',
      }} />

      {!compact && (
        <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#fff',
            backdropFilter: 'blur(8px)', marginBottom: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)', boxShadow: '0 0 8px var(--brand-500)' }} />
            LIVE NOW
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
            @lucia_trend
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            1.2k viendo
          </div>
        </div>
      )}
    </div>
  )
}
