import type { Metadata } from 'next'
import { VerifyCurrentPasswordScreen } from './_components/VerifyCurrentPasswordScreen'

export const metadata: Metadata = {
  title: 'Cambiar contraseña — Livento',
}

export default function CambiarContrasenaPage() {
  return <VerifyCurrentPasswordScreen />
}
