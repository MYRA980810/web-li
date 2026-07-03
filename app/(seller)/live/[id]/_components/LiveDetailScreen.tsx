import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import type { LiveResponse } from '@/lib/liveActions'

const STATUS_CHIP_LABEL: Record<LiveResponse['status'], string> = {
  SCHEDULED: 'Programado',
  LIVE: 'En Vivo',
  ENDED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_OVERLAY_LABEL: Record<LiveResponse['status'], string> = {
  SCHEDULED: 'Próximamente',
  LIVE: 'En Vivo',
  ENDED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_CLASS: Record<LiveResponse['status'], string> = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
}

function formatEventDate(iso: string): string {
  const date = new Date(iso)
  const formatted = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatEventTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
}

function formatWeekday(iso: string): string {
  const label = new Date(iso).toLocaleDateString('es-MX', { weekday: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function calendarMonthAbbr(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase()
}

// Analog hand angles (deg) driven by the live's real scheduled time — not
// decorative filler, the clock face actually points at the event's hour.
function clockHandAngles(iso: string): { hourDeg: number; minuteDeg: number } {
  const date = new Date(iso)
  const minutes = date.getMinutes()
  const hours = date.getHours() % 12
  return { hourDeg: hours * 30 + minutes * 0.5, minuteDeg: minutes * 6 }
}

function LiveHero({ live }: { live: LiveResponse }) {
  const statusClass = STATUS_CLASS[live.status]

  return (
    <div className="live-detail-hero">
      {live.thumbnailUrl ? (
        <Image
          src={live.thumbnailUrl}
          alt={live.title}
          width={480}
          height={220}
          className="live-detail-hero-img"
        />
      ) : (
        <div className="live-detail-hero-emoji">🎬</div>
      )}
      <span className={`live-detail-overlay-badge ${statusClass}`}>
        <span className="dot" aria-hidden="true" />
        {STATUS_OVERLAY_LABEL[live.status]}
      </span>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 pt-20 px-5 text-center">
      <span className="text-[48px] opacity-40">🎬</span>
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold text-(--ink-0)">Live no encontrado</p>
        <p className="text-[14px] text-(--ink-3)">Este live no existe o ya no está disponible.</p>
      </div>
      <Link href="/live" className="live-launch-btn text-[14px]">
        Volver a Live
      </Link>
    </div>
  )
}

function DetailContent({ live }: { live: LiveResponse }) {
  const statusClass = STATUS_CLASS[live.status]

  return (
    <div className="flex flex-col gap-4">
      <LiveHero live={live} />

      <div className="flex flex-col gap-2">
        <p className="font-display font-bold text-[24px] text-(--ink-0) leading-tight">
          {live.title}
        </p>
        <span className={`live-detail-status-chip ${statusClass}`}>
          {STATUS_CHIP_LABEL[live.status]}
        </span>
      </div>

      {live.scheduledAt && (
        <>
          <div className="glass live-detail-meta-card">
            <div className="live-detail-calendar-icon" aria-hidden="true">
              <span className="live-detail-calendar-month">{calendarMonthAbbr(live.scheduledAt)}</span>
              <span className="live-detail-calendar-day">{new Date(live.scheduledAt).getDate()}</span>
            </div>
            <div>
              <p className="live-detail-meta-label">Fecha</p>
              <p className="live-detail-meta-value">{formatEventDate(live.scheduledAt)}</p>
              <p className="live-detail-meta-sub">{formatWeekday(live.scheduledAt)}</p>
            </div>
          </div>

          <div className="glass live-detail-meta-card">
            <div className="live-detail-clock-face" aria-hidden="true">
              <span className="live-detail-clock-tick n12" />
              <span className="live-detail-clock-tick n3" />
              <span className="live-detail-clock-tick n6" />
              <span className="live-detail-clock-tick n9" />
              <span
                className="live-detail-clock-hand hour"
                style={{ transform: `rotate(${clockHandAngles(live.scheduledAt).hourDeg}deg)` }}
              />
              <span
                className="live-detail-clock-hand minute"
                style={{ transform: `rotate(${clockHandAngles(live.scheduledAt).minuteDeg}deg)` }}
              />
              <span className="live-detail-clock-center" />
            </div>
            <div>
              <p className="live-detail-meta-label">Hora</p>
              <p className="live-detail-meta-value">{formatEventTime(live.scheduledAt)}</p>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 mt-3">
        <button type="button" className="live-detail-edit-btn">
          Editar Live
        </button>
        <button type="button" className="live-detail-announce-btn">
          Anunciar Ahora
        </button>
      </div>
    </div>
  )
}

type Props = { live: LiveResponse | null }

export function LiveDetailScreen({ live }: Props) {
  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/live" className="store-back-btn" aria-label="Volver">
            ←
          </Link>
          <span className="font-display font-bold text-[14px] text-brand-400 tracking-[0.04em]">
            Detalle del Live
          </span>
          <button type="button" className="store-back-btn" aria-label="Más opciones">
            ⋮
          </button>
        </div>

        <div className="px-5 pt-5 pb-2 reveal d1">
          {live ? <DetailContent live={live} /> : <NotFound />}
        </div>

        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <Link
            href="/live"
            className="flex items-center gap-2 text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-display font-bold text-[14px] text-(--ink-0) tracking-[0.06em]">
            Detalle del Live
          </span>
          <button type="button" className="store-back-btn" aria-label="Más opciones">
            ⋮
          </button>
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            {live ? <DetailContent live={live} /> : <NotFound />}
          </div>
        </div>
      </div>
    </>
  )
}
