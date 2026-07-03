import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'

type Props = {
  liveId: string
  totalCount: number
  thumbnails: (string | null)[]
  overflowCount: number
}

function InventoryCard({ totalCount, thumbnails, overflowCount }: Props) {
  return (
    <div className="live-success-inventory-card">
      <div>
        <p className="live-success-inventory-label">Estado de Inventario</p>
        <p className="live-success-inventory-count">
          {totalCount} Producto{totalCount === 1 ? '' : 's'}
        </p>
        <p className="live-success-inventory-sub">Listos para el streaming</p>
      </div>
      <div className="live-success-avatar-stack">
        {thumbnails.map((url, i) =>
          url ? (
            <div key={i} className="live-success-avatar">
              <Image src={url} alt="" width={34} height={34} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div key={i} className="live-success-avatar flex items-center justify-center text-[14px] opacity-50">📦</div>
          ),
        )}
        {overflowCount > 0 && (
          <div className="live-success-avatar-overflow">+{overflowCount}</div>
        )}
      </div>
    </div>
  )
}

function SuccessBody(props: Props) {
  return (
    <>
      <div className="live-success-circle">
        <span className="live-success-ring" aria-hidden="true" />
        <span className="live-success-ring outer" aria-hidden="true" />
        <span className="text-[44px] font-bold text-brand-400">✓</span>
      </div>

      <div className="text-center flex flex-col gap-3">
        <h1 className="font-display font-extrabold text-[28px] leading-tight tracking-[-0.03em] text-(--ink-0)">
          ¡Productos <span className="grad-text">Añadidos</span>!
        </h1>
        <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
          La vinculación se ha completado. Tu catálogo está listo para brillar en la sesión en vivo.
        </p>
      </div>

      <InventoryCard {...props} />

      <div className="flex flex-col gap-3 w-full items-center">
        <Link
          href={`/live/setup/countdown?liveId=${props.liveId}`}
          className="live-launch-btn w-full justify-center text-[14px]"
        >
          Ir a Configuración de Live →
        </Link>
        <Link
          href={`/live/${props.liveId}/products`}
          className="text-[13px] font-semibold text-(--ink-3) hover:text-(--ink-1) transition-colors"
        >
          🛒 Añadir más productos
        </Link>
      </div>
    </>
  )
}

export function ProductsAddedSuccess(props: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="px-5 pt-16 flex flex-col items-center gap-6 reveal d1">
          <SuccessBody {...props} />
        </div>

        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="flex items-center justify-center py-16 px-8">
          <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
            <SuccessBody {...props} />
          </div>
        </div>
      </div>
    </>
  )
}
