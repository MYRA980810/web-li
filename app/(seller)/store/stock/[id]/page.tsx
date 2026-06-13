import { ProductDetailScreen } from './_components/ProductDetailScreen'
import { getProductById } from '@/lib/productActions'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  return <ProductDetailScreen product={product} />
}
