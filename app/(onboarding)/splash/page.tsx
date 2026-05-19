import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Livento — La nueva era del shopping',
}

export default function SplashPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-livento-dark overflow-hidden">
      {/* Subtle teal glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-4 z-10">
        <h1 className="text-6xl font-black tracking-wider text-livento-pink drop-shadow-[0_0_24px_rgba(255,31,114,0.5)]">
          LIVENTO
        </h1>
        <p className="text-xs font-semibold tracking-[0.35em] text-white/60 uppercase">
          La nueva era del shopping
        </p>
      </div>

      <Link
        href="/onboarding"
        className="absolute bottom-16 flex flex-col items-center gap-3 z-10 group"
        aria-label="Entrar a la app"
      >
        <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-livento-pink transition-colors duration-300">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/60 group-hover:text-livento-pink transition-colors duration-300 animate-bounce"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
          Toca para entrar
        </span>
      </Link>
    </div>
  )
}
