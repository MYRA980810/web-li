import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NewPasswordChangeScreen } from './_components/NewPasswordChangeScreen'

export const metadata: Metadata = {
  title: 'Nueva contraseña — Livento',
}

export default async function NewPasswordChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/perfil/seguridad/cambiar-contrasena')

  return <NewPasswordChangeScreen changePasswordToken={token} />
}
