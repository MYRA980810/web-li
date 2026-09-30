import { API } from './fetchWithAuth'
import type { Category } from './types'

export type GetCategoriesOptions = {
  /** Seconds to cache the response via the Next data cache. Omit for an uncached fetch. */
  revalidate?: number
}

export async function getCategories(opts: GetCategoriesOptions = {}): Promise<Category[]> {
  const init: RequestInit = opts.revalidate !== undefined ? { next: { revalidate: opts.revalidate } } : {}
  try {
    const res = await fetch(`${API}/api/categories`, init)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.content ?? [])
  } catch {
    return []
  }
}
