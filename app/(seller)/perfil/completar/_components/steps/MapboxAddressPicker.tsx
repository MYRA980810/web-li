'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { forwardGeocode, reverseGeocode, type GeocodedAddress, type GeocodeFailureReason } from './mapboxGeocoding'

export type MapboxAddressPickerProps = {
  onAddressSelect: (address: GeocodedAddress | { latitude: number; longitude: number }) => void
  onFallback: (reason: string) => void
  initialPosition?: { latitude: number; longitude: number }
  initialQuery?: string
}

type SuggestionsState = 'idle' | 'loading' | 'results' | 'empty' | 'error'

const DEFAULT_CENTER: [number, number] = [0, 20]

function errorMessage(reason: GeocodeFailureReason | null): string {
  switch (reason) {
    case 'unauthorized': return 'Token de Mapbox inválido'
    case 'rate-limited': return 'Demasiadas búsquedas, esperá un momento'
    case 'network': return 'Sin conexión'
    case 'server': return 'Error del servidor de mapas'
    default: return 'No se pudo buscar'
  }
}

export function MapboxAddressPicker({ onAddressSelect, onFallback, initialPosition, initialQuery }: MapboxAddressPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const mountedRef = useRef(true)
  const hasFallenBackRef = useRef(false)
  const dragAbortRef = useRef<AbortController | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const [mapReady, setMapReady] = useState(false)
  const [query, setQuery] = useState(initialQuery ?? '')
  const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([])
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState>('idle')
  const [suggestionError, setSuggestionError] = useState<GeocodeFailureReason | null>(null)

  useEffect(() => {
    mountedRef.current = true

    function fallback(reason: string) {
      if (hasFallenBackRef.current) return
      hasFallenBackRef.current = true
      onFallback(reason)
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''
    if (!token) {
      fallback('missing-token')
      return
    }
    if (!mapboxgl.supported()) {
      fallback('webgl-unsupported')
      return
    }

    mapboxgl.accessToken = token

    const startCenter: [number, number] = initialPosition
      ? [initialPosition.longitude, initialPosition.latitude]
      : DEFAULT_CENTER
    const startZoom = initialPosition ? 15 : 1.5

    let map: mapboxgl.Map
    try {
      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/standard',
        center: startCenter,
        zoom: startZoom,
      })
    } catch {
      fallback('map-init-error')
      return
    }

    map.on('error', () => fallback('map-runtime-error'))
    map.on('style.load', () => {
      map.setConfigProperty('basemap', 'lightPreset', 'night')
      map.setConfigProperty('basemap', 'theme', 'monochrome')
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', false)
      map.setConfigProperty('basemap', 'showTransitLabels', false)
      map.setConfigProperty('basemap', 'show3dObjects', true)
    })
    map.on('load', () => {
      if (mountedRef.current) setMapReady(true)
    })

    const marker = new mapboxgl.Marker({ color: '#ff1f87', draggable: true })
      .setLngLat(startCenter)
      .addTo(map)

    marker.on('dragend', () => {
      void (async () => {
        const lngLat = marker.getLngLat()
        onAddressSelect({ latitude: lngLat.lat, longitude: lngLat.lng })

        dragAbortRef.current?.abort()
        const controller = new AbortController()
        dragAbortRef.current = controller

        const result = await reverseGeocode(lngLat.lng, lngLat.lat, token, controller.signal)
        if (!mountedRef.current) return
        if (result.ok && result.results[0]) onAddressSelect(result.results[0])
      })()
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      mountedRef.current = false
      dragAbortRef.current?.abort()
      searchAbortRef.current?.abort()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize once per mount, not per prop change
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) return // short-circuited synchronously in handleQueryChange instead

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''
      if (!token) return

      searchAbortRef.current?.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller
      const myId = ++requestIdRef.current

      setSuggestionsState('loading')

      void forwardGeocode(trimmed, token, controller.signal).then((result) => {
        if (!mountedRef.current) return
        if (myId !== requestIdRef.current) return // stale response, a newer query already fired

        if (!result.ok) {
          if (result.reason === 'aborted') return
          setSuggestionError(result.reason)
          setSuggestionsState('error')
          return
        }

        if (result.results.length === 0) {
          setSuggestions([])
          setSuggestionsState('empty')
          return
        }

        setSuggestions(result.results)
        setSuggestionsState('results')
      })
    }, 300)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [query])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.trim().length < 3) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      searchAbortRef.current?.abort()
      setSuggestionsState('idle')
      setSuggestions([])
    }
  }

  function handleSelectSuggestion(address: GeocodedAddress) {
    setQuery(address.label)
    setSuggestionsState('idle')
    setSuggestions([])

    markerRef.current?.setLngLat([address.longitude, address.latitude])
    mapRef.current?.flyTo({ center: [address.longitude, address.latitude], zoom: 15 })

    onAddressSelect(address)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="mapbox-search-wrap">
        <input
          type="text"
          className="store-input"
          placeholder="Buscar dirección..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {suggestionsState !== 'idle' && (
          <div className="mapbox-suggestions">
            {suggestionsState === 'loading' && <div className="mapbox-suggestion-item">Buscando...</div>}
            {suggestionsState === 'results' &&
              suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="mapbox-suggestion-item"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s.label}
                </button>
              ))}
            {suggestionsState === 'empty' && (
              <div className="mapbox-suggestion-item">No se encontraron resultados</div>
            )}
            {suggestionsState === 'error' && (
              <div className="mapbox-suggestion-item">{errorMessage(suggestionError)}</div>
            )}
          </div>
        )}
      </div>

      <div ref={containerRef} className="mapbox-map-container" />
      {!mapReady && <span className="text-[13px] text-(--ink-3)">Cargando mapa...</span>}
    </div>
  )
}
