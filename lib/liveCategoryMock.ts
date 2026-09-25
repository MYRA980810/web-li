// TODO(backend): replace with live.category once the backend exposes it.
// The /api/lives/active and /api/lives/upcoming cards carry no category, so the
// buyer lives explorer derives a deterministic fake one from the live id. This
// is the ONLY module that knows categories are mocked — every consumer goes
// through LIVE_CATEGORIES / getLiveCategory / getLiveCategoryById, so wiring
// real data is a one-file change.

export type LiveCategoryIconKey =
  | 'all'
  | 'hanger'
  | 'lipstick'
  | 'sofa'
  | 'phone'
  | 'bag'
  | 'shoe'
  | 'diamond'
  | 'ball'
  | 'bear'
  | 'paw'
  | 'cup'

export type LiveCategory = {
  id: string
  label: string
  icon: LiveCategoryIconKey
  /** Accent color used for the category icon, tag and cover fallback. */
  tint: string
}

export const ALL_LIVE_CATEGORY: LiveCategory = { id: 'all', label: 'Todo', icon: 'all', tint: '#ff3d96' }

export const LIVE_CATEGORIES: readonly LiveCategory[] = [
  { id: 'moda', label: 'Moda', icon: 'hanger', tint: '#ff70b3' },
  { id: 'belleza', label: 'Belleza', icon: 'lipstick', tint: '#ff3d96' },
  { id: 'hogar', label: 'Hogar', icon: 'sofa', tint: '#fbbf6b' },
  { id: 'tecnologia', label: 'Tecnología', icon: 'phone', tint: '#38bdf8' },
  { id: 'accesorios', label: 'Accesorios', icon: 'bag', tint: '#a78bfa' },
  { id: 'calzado', label: 'Calzado', icon: 'shoe', tint: '#fb923c' },
  { id: 'joyeria', label: 'Joyería', icon: 'diamond', tint: '#c4b5fd' },
  { id: 'deportes', label: 'Deportes', icon: 'ball', tint: '#4ade80' },
  { id: 'ninos', label: 'Niños', icon: 'bear', tint: '#fcd34d' },
  { id: 'mascotas', label: 'Mascotas', icon: 'paw', tint: '#2dd4bf' },
  { id: 'gourmet', label: 'Gourmet', icon: 'cup', tint: '#f97316' },
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/** Deterministic mock category for a live — same id always maps to the same category. */
export function getLiveCategory(liveId: string): LiveCategory {
  return LIVE_CATEGORIES[hashId(liveId) % LIVE_CATEGORIES.length]!
}

/** Resolves a category id (including the "all" pseudo-category) to its definition. */
export function getLiveCategoryById(categoryId: string): LiveCategory {
  if (categoryId === ALL_LIVE_CATEGORY.id) return ALL_LIVE_CATEGORY
  return LIVE_CATEGORIES.find((c) => c.id === categoryId) ?? ALL_LIVE_CATEGORY
}
