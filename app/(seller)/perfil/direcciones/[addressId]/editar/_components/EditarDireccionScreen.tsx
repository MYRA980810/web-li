'use client'

import { useRouter } from 'next/navigation'
import { Ambient } from '@/components/Ambient'
import type { SellerAddressView } from '@/lib/types'
import { DireccionStep } from '../../../../completar/_components/steps/DireccionStep'

export type EditarDireccionScreenProps = {
  address: SellerAddressView
}

export function EditarDireccionScreen({ address }: EditarDireccionScreenProps) {
  const router = useRouter()

  return (
    <>
      <Ambient />

      <div className="stage screen-enter">
        <div className="store-back-header">
          <button type="button" className="store-back-btn" onClick={() => router.push('/perfil/direcciones')} aria-label="Volver">
            ←
          </button>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold tracking-[0.20em] text-(--ink-3) uppercase">Mi Cuenta</span>
            <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em] uppercase">
              Editar Dirección
            </span>
          </div>
          <span className="w-8 h-8" />
        </div>

        <div className="px-5 pt-6 pb-10 max-w-md mx-auto w-full reveal d1">
          <DireccionStep mode="edit" existingAddress={address} onNext={() => router.push('/perfil/direcciones')} />
        </div>
      </div>
    </>
  )
}
