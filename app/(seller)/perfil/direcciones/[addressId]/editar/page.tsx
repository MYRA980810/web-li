import { redirect } from 'next/navigation'
import { getSellerAddresses } from '@/lib/profileActions'
import { EditarDireccionScreen } from './_components/EditarDireccionScreen'

export default async function EditarDireccionPage({
  params,
}: {
  params: Promise<{ addressId: string }>
}) {
  const { addressId } = await params
  const addresses = await getSellerAddresses()
  const address = addresses.find((a) => a.id === addressId)

  if (!address) redirect('/perfil/direcciones')

  return <EditarDireccionScreen address={address} />
}
