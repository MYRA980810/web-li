import Image from 'next/image'
import { LiventoLogo } from '../../../_components/LiventoLogo'

export function Slide01() {
  return (
    <div className="flex flex-col min-h-full px-6 pt-14 pb-4 bg-livento-dark">
      <LiventoLogo />

      <div className="relative mt-8 w-full aspect-square rounded-2xl overflow-hidden bg-livento-card">
        <Image
          src="/onboarding/slide-01-hero.png"
          alt="Compras en vivo con los mejores vendedores"
          fill
          className="object-contain"
          priority
        />
        <div className="absolute top-3 left-3">
          <LiveBadge />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <h1 className="text-4xl font-bold leading-tight text-white">
          Descubre lo mejor{' '}
          <em className="text-livento-pink not-italic">en vivo</em>
        </h1>
        <p className="text-sm leading-relaxed text-livento-muted">
          Encuentra las últimas tendencias en moda, tech y más, directo desde los
          mejores vendedores de Latam.
        </p>
      </div>
    </div>
  )
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-livento-pink animate-pulse" />
      EN VIVO
    </span>
  )
}
