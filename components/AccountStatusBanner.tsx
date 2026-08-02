export type AccountStatusBannerProps = { status: 'active' | 'pending' | 'disabled' }

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7.2l2.6 2.6L11 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ExclamationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 3.2v4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="7" cy="10.4" r="0.9" fill="currentColor" />
  </svg>
)

const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const STATUS_CONTENT: Record<AccountStatusBannerProps['status'], { title: string; description: string; icon: React.ReactNode }> = {
  active: {
    title: 'Activa y verificada',
    description: 'Cobros y pagos habilitados sin pendientes.',
    icon: <CheckIcon />,
  },
  pending: {
    title: 'Acción requerida',
    description: 'Faltan datos para habilitar todos los cobros y pagos.',
    icon: <ExclamationIcon />,
  },
  disabled: {
    title: 'Cuenta deshabilitada',
    description: 'Los cobros y pagos están suspendidos.',
    icon: <CrossIcon />,
  },
}

export function AccountStatusBanner({ status }: AccountStatusBannerProps) {
  const content = STATUS_CONTENT[status]

  return (
    <div className={`account-status-banner ${status}`}>
      <div className="account-status-dot">{content.icon}</div>
      <div className="flex flex-col">
        <span className="account-status-title">{content.title}</span>
        <span className="account-status-desc">{content.description}</span>
      </div>
    </div>
  )
}
