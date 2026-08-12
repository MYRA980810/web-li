import { getSellerAddresses } from '@/lib/profileActions'
import { NuevaDireccionScreen } from './_components/NuevaDireccionScreen'

export default async function NuevaDireccionPage() {
  const addresses = await getSellerAddresses()
  return <NuevaDireccionScreen isFirstAddress={addresses.length === 0} />
}
