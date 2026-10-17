import Image from 'next/image'

export type NowShowingCardProps = {
  name: string
  priceLabel: string
  imageUrl: string | null
  remaining: number
  adding: boolean
  /** Result line under the card (error or confirmation). */
  feedback: { tone: 'error' | 'success'; text: string } | null
  onAdd: () => void
}

/** The product the seller has pinned right now. */
export function NowShowingCard({ name, priceLabel, imageUrl, remaining, adding, feedback, onAdd }: NowShowingCardProps) {
  const soldOut = remaining === 0

  return (
    <section aria-label="Producto mostrado ahora" className="flex flex-col gap-1.5">
      <div className="live-player-now-card">
        <div className="live-player-now-thumb">
          {imageUrl && <Image src={imageUrl} alt={name} fill sizes="64px" className="object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-300">Mostrando ahora</p>
          <p className="font-display font-extrabold text-[17px] leading-tight text-white truncate">{name}</p>
          <p className="text-[14px] text-white/70 truncate">
            <span className="font-display font-extrabold text-white">{priceLabel}</span>
            {' · '}
            {soldOut ? 'agotado' : `quedan ${remaining}`}
          </p>
        </div>
        <button type="button" onClick={onAdd} disabled={soldOut || adding} className="live-player-add-btn">
          {soldOut ? 'Agotado' : adding ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
      {feedback && (
        <p
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={`px-2 text-[12px] font-semibold ${feedback.tone === 'error' ? 'text-brand-300' : 'text-(--teal-400)'}`}
        >
          {feedback.text}
        </p>
      )}
    </section>
  )
}
