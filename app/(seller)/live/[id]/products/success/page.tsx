import { getLiveProducts } from '@/lib/liveActions'
import { ProductsAddedSuccess } from './_components/ProductsAddedSuccess'

export default async function ProductsAddedSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getLiveProducts(id)
  const products = result.ok ? result.products : []

  return (
    <ProductsAddedSuccess
      liveId={id}
      totalCount={products.length}
      thumbnails={products.slice(0, 3).map((p) => p.imageUrl)}
      overflowCount={Math.max(0, products.length - 3)}
    />
  )
}
