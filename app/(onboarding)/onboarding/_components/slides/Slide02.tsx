import Image from 'next/image'
import { LiventoLogo } from '../../../_components/LiventoLogo'

export function Slide02() {
  return (
    <div className="flex flex-col min-h-full px-6 pt-14 pb-4 bg-livento-dark">
      <div className="flex items-center justify-between">
        <LiventoLogo />
        <button
          type="button"
          aria-label="Chat"
          className="w-10 h-10 rounded-full bg-livento-pink/20 flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF1F72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Live card */}
      <div className="relative mt-8 w-full rounded-2xl overflow-hidden bg-livento-card">
        {/* Streamer image with gradient overlay */}
        <div className="relative w-full aspect-4/3">
          <Image
            src="/onboarding/slide-02-streamer.png"
            alt="Streamer en vivo"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-livento-card" />

          {/* Floating hearts - right edge */}
          <div className="absolute right-3 top-1/4 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <span key={i} className="text-livento-pink text-xl drop-shadow-md">♥</span>
            ))}
          </div>
        </div>

        {/* Chat messages overlay */}
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
          <ChatMessage user="@alex_m" text="¿Tienen talla M disponible? 😊" />
          <ChatMessage user="@lucia_trend" text="¡Me encanta el color!" />
          <div className="mt-1">
            <LiveNowPill />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-4xl font-bold leading-tight text-white">
          Interactúa y participa
        </h1>
        <p className="text-sm leading-relaxed text-livento-muted text-center">
          Sé parte de la comunidad. Chatea en tiempo real, envía reacciones y haz
          tus preguntas directamente al vendedor durante el live.
        </p>
      </div>
    </div>
  )
}

function ChatMessage({ user, text }: { user: string; text: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-livento-pink text-xs font-semibold">{user}</span>
      <span className="text-white/90 text-xs">{text}</span>
    </div>
  )
}

function LiveNowPill() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-livento-pink/15 border border-livento-pink/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-livento-pink animate-pulse" />
      LIVE NOW
    </span>
  )
}
