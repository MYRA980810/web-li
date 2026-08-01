import { SellerProfileScreen } from './_components/SellerProfileScreen'
import { getMyProducts } from '@/lib/productActions'
import { getCurrentUserProfile } from '@/lib/profileActions'

export default async function SellerProfilePage() {
  const [products, profile] = await Promise.all([
    getMyProducts(),
    getCurrentUserProfile(),
  ])
  return <SellerProfileScreen productCount={products.length} profile={profile} />
}
