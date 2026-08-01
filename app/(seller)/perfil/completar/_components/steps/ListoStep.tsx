import Link from 'next/link'

export function ListoStep() {
  return (
    <>
      {/* ===== MOBILE ===== */}
      <div className="lg:hidden flex flex-col items-center gap-6 pt-10 text-center">
        <div className="store-success-circle">
          <span className="text-[48px] font-bold text-brand-400">✓</span>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-display font-extrabold text-[26px] leading-tight tracking-[-0.03em] text-(--ink-0)">
            ¡Perfil Completado!
          </h1>
          <p className="text-[14px] text-(--ink-2) leading-relaxed max-w-xs mx-auto">
            Ya podés vender en tus Lives, recibir pagos y gestionar tu tienda sin restricciones.
          </p>
        </div>

        <Link href="/perfil" className="live-launch-btn w-full justify-center text-[14px]">
          Comenzar a Explorar
        </Link>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col items-center gap-8 pt-10 text-center">
        <div className="store-success-circle">
          <span className="text-[48px] font-bold text-brand-400">✓</span>
        </div>

        <div className="flex flex-col gap-3 max-w-sm">
          <h1 className="font-display font-extrabold text-[30px] leading-tight tracking-[-0.03em] text-(--ink-0)">
            ¡Perfil Completado!
          </h1>
          <p className="text-[14px] text-(--ink-2) leading-relaxed">
            Ya podés vender en tus Lives, recibir pagos y gestionar tu tienda sin restricciones.
          </p>
        </div>

        <Link href="/perfil" className="live-launch-btn justify-center text-[14px]">
          Comenzar a Explorar
        </Link>
      </div>
    </>
  )
}
