import { redirect } from 'next/navigation'
import { getMyProducts, getMyCategories } from '@/lib/productActions'
import { GoLiveCountdownScreen } from './_components/GoLiveCountdownScreen'

export default async function GoLiveCountdownPage({
  searchParams,
}: {
  searchParams: Promise<{ liveId?: string }>
}) {
  const { liveId } = await searchParams
  if (!liveId) redirect('/live/setup')

  const [products, categories] = await Promise.all([
    getMyProducts(),
    getMyCategories(),
  ])

  return <GoLiveCountdownScreen liveId={liveId} products={products} categories={categories} />
}
