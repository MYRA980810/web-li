import Image from 'next/image'
import { LiventoLogo } from '../../../_components/LiventoLogo'

export function Slide03() {
  return (
    <div className="relative flex flex-col min-h-screen bg-livento-dark">
      <div className="absolute inset-0">
        <Image
          src="/onboarding/slide-03-bg.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-livento-dark" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <LiventoLogo />
          <span className="flex items-center gap-1.5 text-white text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-livento-pink" />
            LIVE NOW
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3 pb-2">
          <span className="text-xs font-semibold tracking-widest text-livento-pink uppercase">
            Smart Shopping
          </span>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Compra sin perderte nada
          </h1>
          <p className="text-sm leading-relaxed text-livento-muted">
            Encuentra tus productos favoritos y cómpralos en segundos, sin
            interrumpir tu experiencia en vivo.
          </p>
        </div>
      </div>
    </div>
  )
}
