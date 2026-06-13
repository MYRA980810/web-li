import type { Category } from './types'

const API = process.env.API_URL ?? 'http://localhost:8080'

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.content ?? [])
  } catch {
    return []
  }
}
