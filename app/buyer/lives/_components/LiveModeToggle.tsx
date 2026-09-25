'use client'

export type LiveViewMode = 'vivo' | 'proximos'

export type LiveModeToggleProps = {
  mode: LiveViewMode
  liveCount: number
  upcomingCount: number
  onChange: (mode: LiveViewMode) => void
}

export function LiveModeToggle({ mode, liveCount, upcomingCount, onChange }: LiveModeToggleProps) {
  return (
    <div className="buyer-live-mode-toggle" role="tablist" aria-label="Tipo de lives">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'vivo'}
        onClick={() => onChange('vivo')}
        className={`buyer-live-mode-btn${mode === 'vivo' ? ' active-live' : ''}`}
      >
        <span className="buyer-live-mode-dot" />
        En vivo · {liveCount}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'proximos'}
        onClick={() => onChange('proximos')}
        className={`buyer-live-mode-btn${mode === 'proximos' ? ' active-proximos' : ''}`}
      >
        Próximos · {upcomingCount}
      </button>
    </div>
  )
}
