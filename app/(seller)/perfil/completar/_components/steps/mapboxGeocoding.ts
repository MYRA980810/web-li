export type GeocodedAddress = {
  street: string
  extNumber?: string
  neighborhood?: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude: number
  longitude: number
  label: string
}

export type GeocodeFailureReason = 'network' | 'unauthorized' | 'rate-limited' | 'server' | 'aborted'

export type ForwardGeocodeResult =
  | { ok: true; results: GeocodedAddress[] }
  | { ok: false; reason: GeocodeFailureReason }

// Mapbox Geocoding API v6 feature shape (GeoJSON Feature). Only the fields this
// form actually reads are declared — the real response has many more.
type MapboxContextEntry = { name?: string; address_number?: string; region_code?: string; country_code_alpha_3?: string }
type MapboxFeatureV6 = {
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    full_address?: string
    place_formatted?: string
    name?: string
    context?: {
      address?: MapboxContextEntry
      street?: MapboxContextEntry
      neighborhood?: MapboxContextEntry
      postcode?: MapboxContextEntry
      place?: MapboxContextEntry
      region?: MapboxContextEntry
      country?: MapboxContextEntry
    }
  }
}

function reasonFromStatus(status: number): GeocodeFailureReason {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 429) return 'rate-limited'
  return 'server'
}

// NOTE (implementation-time check): mapped from the documented v6 `context.*` shape.
// Log one raw response during manual QA and confirm these keys before shipping —
// a wrong key here fails silently (empty field), not a crash.
export function parseFeatureToAddress(feature: MapboxFeatureV6): GeocodedAddress {
  const ctx = feature.properties.context ?? {}
  const [longitude, latitude] = feature.geometry.coordinates

  return {
    street: ctx.street?.name ?? ctx.address?.name ?? feature.properties.name ?? '',
    extNumber: ctx.address?.address_number,
    neighborhood: ctx.neighborhood?.name,
    city: ctx.place?.name ?? '',
    state: ctx.region?.region_code ?? ctx.region?.name ?? '',
    zipCode: ctx.postcode?.name ?? '',
    country: ctx.country?.country_code_alpha_3 ?? '',
    latitude,
    longitude,
    label: feature.properties.full_address ?? feature.properties.place_formatted ?? feature.properties.name ?? '',
  }
}

async function runGeocode(url: string, signal: AbortSignal): Promise<ForwardGeocodeResult> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { ok: false, reason: 'aborted' }
    return { ok: false, reason: 'network' }
  }

  if (!res.ok) return { ok: false, reason: reasonFromStatus(res.status) }

  const data = (await res.json()) as { features?: MapboxFeatureV6[] }
  return { ok: true, results: (data.features ?? []).map(parseFeatureToAddress) }
}

export function forwardGeocode(query: string, token: string, signal: AbortSignal): Promise<ForwardGeocodeResult> {
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&autocomplete=true&types=address&limit=5&access_token=${encodeURIComponent(token)}`
  return runGeocode(url, signal)
}

export function reverseGeocode(lng: number, lat: number, token: string, signal: AbortSignal): Promise<ForwardGeocodeResult> {
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${encodeURIComponent(token)}`
  return runGeocode(url, signal)
}
