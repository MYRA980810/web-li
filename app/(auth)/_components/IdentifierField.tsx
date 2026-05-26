'use client'

export type IdentifierFieldProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

function detectInputType(value: string): 'email' | 'phone' {
  return value.includes('@') ? 'email' : 'phone'
}

export function IdentifierField({ value, onChange, className }: IdentifierFieldProps) {
  const inputType = detectInputType(value)

  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label className="label">{inputType === 'email' ? 'Email' : 'Teléfono'}</label>
      <div className="input-wrap">
        <span className="icon">{inputType === 'email' ? '@' : '☎'}</span>
        <input
          type="text"
          inputMode={inputType === 'email' ? 'email' : 'tel'}
          placeholder="Email o teléfono"
          autoComplete="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
