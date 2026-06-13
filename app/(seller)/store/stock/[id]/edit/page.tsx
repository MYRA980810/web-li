import { EditProductForm } from './_components/EditProductForm'
import { getProductById } from '@/lib/productActions'
import { getCategories } from '@/lib/categoryActions'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ])
  return <EditProductForm product={product} categories={categories} />
}
