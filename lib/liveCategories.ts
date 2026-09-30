import type { Category } from './types'

// Presentation layer for backend live categories. Pure module (no server
// imports) so both the server page and client components can use it.
// Icon, tint and short label are keyed by SLUG — never by UUID, because
// category ids differ between environments.

export type LiveCategoryIconKey =
  | 'all'
  | 'hanger'
  | 'tshirt'
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
  | 'tag'

export type LiveCategory = {
  /** Backend category UUID, or 'all' for the pseudo-category. */
  id: string
  slug: string
  label: string
  icon: LiveCategoryIconKey
  /** Accent color used for the category icon, tag and cover fallback. */
  tint: string
}

type LiveCategoryPresentation = Pick<LiveCategory, 'label' | 'icon' | 'tint'>

export const DEFAULT_LIVE_TINT = '#ff3d96'

export const ALL_LIVE_CATEGORY: LiveCategory = {
  id: 'all',
  slug: 'all',
  label: 'Todo',
  icon: 'all',
  tint: DEFAULT_LIVE_TINT,
}

const PRESENTATION_BY_SLUG: Readonly<Record<string, LiveCategoryPresentation>> = {
  // Featured
  'moda-femenina': { label: 'Mujer', icon: 'hanger', tint: '#ff70b3' },
  'moda-masculina': { label: 'Hombre', icon: 'tshirt', tint: '#60a5fa' },
  belleza: { label: 'Belleza', icon: 'lipstick', tint: '#ff3d96' },
  'accesorios-moda': { label: 'Accesorios', icon: 'bag', tint: '#a78bfa' },
  calzado: { label: 'Calzado', icon: 'shoe', tint: '#fb923c' },
  'joyeria-relojes': { label: 'Joyería', icon: 'diamond', tint: '#c4b5fd' },
  electronica: { label: 'Tecnología', icon: 'phone', tint: '#38bdf8' },
  'hogar-decoracion': { label: 'Hogar', icon: 'sofa', tint: '#fbbf6b' },
  // Non-featured — mapped so card tints still vary
  'deportes-fitness': { label: 'Deportes', icon: 'ball', tint: '#4ade80' },
  'bebes-ninos': { label: 'Niños', icon: 'bear', tint: '#fcd34d' },
  mascotas: { label: 'Mascotas', icon: 'paw', tint: '#2dd4bf' },
  'cocina-alimentos': { label: 'Gourmet', icon: 'cup', tint: '#f97316' },
}

/** Maps a backend category to its presentation; unknown slugs fall back to the backend name. */
export function resolveLiveCategory(category: Category): LiveCategory {
  const presentation = PRESENTATION_BY_SLUG[category.slug] ?? {
    label: category.name,
    icon: 'tag',
    tint: DEFAULT_LIVE_TINT,
  }
  return { id: category.id, slug: category.slug, ...presentation }
}

/** Featured categories only, ordered by displayOrder (nulls last), then name. */
export function selectFeatured(all: readonly Category[]): Category[] {
  return all
    .filter((c) => c.featured === true)
    .sort((a, b) => {
      const ao = a.displayOrder ?? Number.POSITIVE_INFINITY
      const bo = b.displayOrder ?? Number.POSITIVE_INFINITY
      if (ao !== bo) return ao - bo
      return a.name.localeCompare(b.name, 'es')
    })
}
