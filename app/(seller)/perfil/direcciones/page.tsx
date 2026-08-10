import { DireccionesScreen } from './_components/DireccionesScreen'
import { getSellerAddresses } from '@/lib/profileActions'

export default async function DireccionesPage() {
  const addresses = await getSellerAddresses()
  return <DireccionesScreen addresses={addresses} />
}
