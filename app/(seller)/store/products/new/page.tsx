import { AddProductForm } from './_components/AddProductForm'

const API = process.env.API_URL ?? 'http://localhost:8080'

export type Category = { id: string; name: string }

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.content ?? [])
  } catch {
    return []
  }
}

export default async function AddProductPage() {
  const categories = await getCategories()
  return <AddProductForm categories={categories} />
}
