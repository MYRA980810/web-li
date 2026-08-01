'use client'

import { useState } from 'react'
import { addSellerAddress } from '@/lib/profileActions'

export type DireccionStepProps = {
  onNext: () => void
}

export function DireccionStep({ onNext }: DireccionStepProps) {
  const [street, setStreet] = useState('')
  const [extNumber, setExtNumber] = useState('')
  const [intNumber, setIntNumber] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('MEX')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      setError('Completá los campos requeridos')
      return
    }

    setLoading(true)
    const result = await addSellerAddress({
      street: street.trim(),
      extNumber: extNumber.trim() || undefined,
      intNumber: intNumber.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim().toUpperCase(),
      isDefault: true,
    })
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onNext()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="store-form-label" htmlFor="dir-city">Ciudad</label>
        <input
          id="dir-city"
          type="text"
          className="store-input"
          placeholder="Ciudad de México"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div>
        <label className="store-form-label" htmlFor="dir-street">Dirección Exacta</label>
        <input
          id="dir-street"
          type="text"
          className="store-input"
          placeholder="Av. Siempre Viva"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="store-form-label" htmlFor="dir-ext">Número Ext.</label>
          <input
            id="dir-ext"
            type="text"
            className="store-input"
            placeholder="123"
            value={extNumber}
            onChange={(e) => setExtNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="store-form-label" htmlFor="dir-int">Número Int.</label>
          <input
            id="dir-int"
            type="text"
            className="store-input"
            placeholder="Depto 4B"
            value={intNumber}
            onChange={(e) => setIntNumber(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="store-form-label" htmlFor="dir-neighborhood">Colonia</label>
        <input
          id="dir-neighborhood"
          type="text"
          className="store-input"
          placeholder="Roma Norte"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="store-form-label" htmlFor="dir-state">Estado</label>
          <input
            id="dir-state"
            type="text"
            className="store-input"
            placeholder="CDMX"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div>
          <label className="store-form-label" htmlFor="dir-zip">Código Postal</label>
          <input
            id="dir-zip"
            type="text"
            className="store-input"
            placeholder="06700"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="store-form-label" htmlFor="dir-country">País</label>
        <input
          id="dir-country"
          type="text"
          className="store-input uppercase"
          placeholder="MEX"
          maxLength={3}
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
        />
      </div>

      {error && <p className="text-[12px] text-brand-400">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : 'Guardar y continuar'}
      </button>
    </div>
  )
}
