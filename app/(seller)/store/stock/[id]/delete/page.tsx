import { getProductById } from '@/lib/productActions'
import { DeleteProductConfirm } from './_components/DeleteProductConfirm'

export default async function DeleteProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  return <DeleteProductConfirm product={product} />
}
