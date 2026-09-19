import type { ProductImageInfo } from './types'

// Decorative fallback for stores/products with no real image — the backend
// has no color/gradient field, so we derive a stable pick from the entity id.
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #ff8ac2 0%, #c026a3 55%, #6b0f5c 100%)',
  'linear-gradient(135deg, #5eead4 0%, #0d9488 55%, #043b36 100%)',
  'linear-gradient(135deg, #fbbf6b 0%, #c2410c 55%, #451a03 100%)',
  'linear-gradient(135deg, #f0abfc 0%, #a21caf 55%, #4a044e 100%)',
  'linear-gradient(135deg, #93c5fd 0%, #4338ca 55%, #1e1b4b 100%)',
  'linear-gradient(135deg, #c4b5fd 0%, #6d28d9 55%, #2e1065 100%)',
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

export function fallbackGradient(id: string): string {
  return FALLBACK_GRADIENTS[hashId(id) % FALLBACK_GRADIENTS.length]!
}

export function storeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}

export function getPrimaryImageUrl(images: ProductImageInfo[]): string | null {
  if (images.length === 0) return null
  const primary = images.find((img) => img.primary)
  if (primary) return primary.url
  const sorted = [...images].sort((a, b) => a.position - b.position)
  return sorted[0]?.url ?? null
}
