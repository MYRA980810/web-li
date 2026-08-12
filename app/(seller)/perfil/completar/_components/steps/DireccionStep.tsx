'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { addSellerAddress, updateSellerAddress } from '@/lib/profileActions'
import { ADDRESS_TYPE_META, type AddressType, type SellerAddressView } from '@/lib/types'
import type { GeocodedAddress } from './mapboxGeocoding'
import { AddressTypePicker } from './AddressTypePicker'

const MapboxAddressPicker = dynamic(
  () => import('./MapboxAddressPicker').then((m) => m.MapboxAddressPicker),
  { ssr: false }
)

export type DireccionStepProps = {
  onNext: () => void
  mode?: 'create' | 'edit'
  existingAddress?: SellerAddressView
  isFirstAddress?: boolean
}

export function DireccionStep({ onNext, mode = 'create', existingAddress, isFirstAddress = true }: DireccionStepProps) {
  const [street, setStreet] = useState(existingAddress?.street ?? '')
  const [extNumber, setExtNumber] = useState(existingAddress?.extNumber ?? '')
  const [intNumber, setIntNumber] = useState(existingAddress?.intNumber ?? '')
  const [neighborhood, setNeighborhood] = useState(existingAddress?.neighborhood ?? '')
  const [city, setCity] = useState(existingAddress?.city ?? '')
  const [state, setState] = useState(existingAddress?.state ?? '')
  const [zipCode, setZipCode] = useState(existingAddress?.zipCode ?? '')
  const [country, setCountry] = useState(existingAddress?.country ?? 'MEX')
  const [latitude, setLatitude] = useState<number | null>(existingAddress?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(existingAddress?.longitude ?? null)
  const [addressType, setAddressType] = useState<AddressType | null>(existingAddress?.addressType ?? null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [mapAvailable, setMapAvailable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddressSelect(address: GeocodedAddress | { latitude: number; longitude: number }) {
    setLatitude(address.latitude)
    setLongitude(address.longitude)

    if ('street' in address) {
      setStreet(address.street)
      if (address.extNumber) setExtNumber(address.extNumber)
      if (address.neighborhood) setNeighborhood(address.neighborhood)
      setCity(address.city)
      setState(address.state)
      setZipCode(address.zipCode)
      if (address.country) setCountry(address.country.toUpperCase())
    }
  }

  function handleMapFallback(reason: string) {
    console.warn('[DireccionStep] map fallback:', reason)
    setMapAvailable(false)
  }

  async function handleSubmit() {
    setError(null)

    if (!street.trim() || !extNumber.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      setError('Completá los campos requeridos')
      return
    }
    if (!addressType) {
      setError('Seleccioná el tipo de inmueble')
      return
    }

    const basePayload = {
      street: street.trim(),
      extNumber: extNumber.trim(),
      intNumber: intNumber.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim().toUpperCase(),
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      addressType,
    }

    setLoading(true)
    const result = mode === 'edit' && existingAddress
      ? await updateSellerAddress(existingAddress.id, basePayload)
      : await addSellerAddress({ ...basePayload, isDefault: isFirstAddress })
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onNext()
  }

  return (
    <div className="flex flex-col gap-5">
      {mapAvailable ? (
        <MapboxAddressPicker
          onAddressSelect={handleAddressSelect}
          onFallback={handleMapFallback}
          initialPosition={
            existingAddress?.latitude != null && existingAddress?.longitude != null
              ? { latitude: existingAddress.latitude, longitude: existingAddress.longitude }
              : undefined
          }
          initialQuery={
            existingAddress
              ? `${existingAddress.street}${existingAddress.extNumber ? ` ${existingAddress.extNumber}` : ''}, ${existingAddress.city}, ${existingAddress.state}`
              : undefined
          }
        />
      ) : (
        <p className="text-[12px] text-(--ink-3)">
          El autocompletado no está disponible. Completá los campos manualmente.
        </p>
      )}

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

      <div>
        <label className="store-form-label" htmlFor="dir-address-type">Tipo de Inmueble</label>
        <button
          id="dir-address-type"
          type="button"
          className="store-input flex items-center justify-between text-left"
          onClick={() => setPickerOpen(true)}
        >
          <span className={addressType ? 'text-(--ink-0)' : 'text-(--ink-3)'}>
            {addressType ? `${ADDRESS_TYPE_META[addressType].emoji}  ${ADDRESS_TYPE_META[addressType].label}` : 'Seleccioná el tipo de inmueble'}
          </span>
          <span className="text-(--ink-3)">›</span>
        </button>
      </div>

      <AddressTypePicker
        open={pickerOpen}
        value={addressType}
        onSelect={setAddressType}
        onClose={() => setPickerOpen(false)}
      />

      {error && <p className="text-[12px] text-brand-400">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="live-launch-btn w-full justify-center text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Guardar y continuar'}
      </button>
    </div>
  )
}
