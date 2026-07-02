'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import type { LiveResponse } from '@/lib/liveActions'
import type { StoreResponse } from '@/lib/storeActions'

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const WEEK_WINDOW_DAYS = 6

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

function formatLiveDateTime(iso: string): string {
  const date = new Date(iso)
  const day  = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  const time = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
  return `${day}, ${time}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

type WeekDay = {
  date: Date
  label: string
  dayNum: number
  hasScheduledLive: boolean
}

function buildWeekDays(scheduledLives: LiveResponse[]): WeekDay[] {
  const today = new Date()
  const scheduledDates = scheduledLives
    .map((l) => (l.scheduledAt ? new Date(l.scheduledAt) : null))
    .filter((d): d is Date => d !== null)

  return Array.from({ length: WEEK_WINDOW_DAYS }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return {
      date,
      label: WEEKDAY_LABELS[date.getDay()],
      dayNum: date.getDate(),
      hasScheduledLive: scheduledDates.some((d) => isSameDay(d, date)),
    }
  })
}

// ─── Header ─────────────────────────────────────────────────────────────────

function HubHeader({ store }: { store: StoreResponse | null }) {
  const initial = (store?.name?.[0] ?? 'S').toUpperCase()

  return (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full border-2 border-brand-400 overflow-hidden relative shrink-0 shadow-[0_0_16px_rgba(255,31,135,0.35)]">
          {store?.logoUrl ? (
            <Image src={store.logoUrl} alt={store.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-grad-pink flex items-center justify-center font-display font-bold text-[15px] text-[#1a0612]">
              {initial}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-display font-bold text-[15px] text-(--ink-0) leading-tight truncate">
            {store?.name ?? 'Mi Tienda'}
          </span>
          <span className="text-[12px] text-(--ink-3) truncate">
            @{store?.slug ?? 'mi-tienda'}
          </span>
        </div>
      </div>
      <button className="home-nav-icon" aria-label="Notificaciones">🔔</button>
    </>
  )
}

// ─── Stats row ──────────────────────────────────────────────────────────────

function StatsRow({ followerCount, livesCount }: { followerCount: number; livesCount: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="glass flex flex-col items-center justify-center gap-1 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Followers</span>
        <span className="font-display font-bold text-[20px] text-brand-400">{formatCompact(followerCount)}</span>
      </div>
      <div className="glass flex flex-col items-center justify-center gap-1 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Rating</span>
        <span className="font-display font-bold text-[20px] text-(--ink-0)">—</span>
      </div>
      <div className="glass flex flex-col items-center justify-center gap-1 py-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-(--ink-3) uppercase">Lives</span>
        <span className="font-display font-bold text-[20px] text-(--ink-0)">{livesCount}</span>
      </div>
    </div>
  )
}

// ─── Schedule ───────────────────────────────────────────────────────────────

function DayPicker({ days, selected, onSelect }: { days: WeekDay[]; selected: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {days.map((d, i) => (
        <button
          key={d.date.toISOString()}
          className={`live-hub-day${i === selected ? ' selected' : ''}`}
          onClick={() => onSelect(i)}
          aria-pressed={i === selected}
          aria-label={`${d.label} ${d.dayNum}`}
        >
          <span className="live-hub-day-label">{d.label}</span>
          <span className="live-hub-day-num">{d.dayNum}</span>
          {d.hasScheduledLive && <span className="live-hub-day-dot" />}
        </button>
      ))}
    </div>
  )
}

function NextLiveCard({ live }: { live: LiveResponse }) {
  return (
    <div className="glass flex items-center gap-3 p-3">
      <div className="relative w-16 h-16 rounded-(--r-md) overflow-hidden shrink-0 bg-(--bg-2)">
        {live.thumbnailUrl ? (
          <Image src={live.thumbnailUrl} alt={live.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[24px] opacity-50">🎬</div>
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="live-hub-next-badge w-fit">Próximo</span>
        <p className="text-[14px] font-semibold text-(--ink-0) leading-snug truncate">{live.title}</p>
        {live.scheduledAt && (
          <p className="text-[12px] text-(--ink-3)">{formatLiveDateTime(live.scheduledAt)}</p>
        )}
      </div>
    </div>
  )
}

function ScheduleEmptyState() {
  return (
    <div className="glass flex flex-col items-center gap-4 py-10 px-6 text-center">
      <div className="stock-empty-icon">
        <span className="text-[32px]">📅</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[15px] font-semibold text-(--ink-0)">Aún no tienes lives programados</p>
        <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
          ¡Comienza a conectar con tu audiencia! Organiza tu primer evento y aumenta tus ventas en vivo.
        </p>
      </div>
    </div>
  )
}

// ─── History ────────────────────────────────────────────────────────────────

function HistoryEmptyState() {
  return (
    <div className="glass flex flex-col items-center gap-4 py-10 px-6 text-center">
      <div className="stock-empty-icon">
        <span className="text-[32px]">🎬</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[15px] font-semibold text-(--ink-0)">Aún no tienes historial de lives</p>
        <p className="text-[13px] text-(--ink-3) leading-relaxed max-w-xs mx-auto">
          Aquí podrás ver tus transmisiones pasadas una vez que hayas realizado tus primeros lives.
        </p>
        {/*
          "Consejos para tu primer live" has no real destination yet (no /live/tips
          route exists). Rendered as a plain non-interactive span styled as a link
          instead of next/link to avoid shipping a dead link that 404s.
        */}
        <span className="text-[13px] font-semibold text-brand-400 cursor-default">
          Consejos para tu primer live
        </span>
      </div>
    </div>
  )
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export type LiveHubScreenProps = {
  store: StoreResponse | null
  scheduledLives: LiveResponse[]
  endedLives: LiveResponse[]
  followerCount: number
}

export function LiveHubScreen({ store, scheduledLives, endedLives, followerCount }: LiveHubScreenProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const days = buildWeekDays(scheduledLives)

  const nextLive = [...scheduledLives]
    .filter((l) => l.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime())[0]
    ?? null

  // "Lives" stat = total of scheduled + ended lives fetched for this screen
  // (the only two statuses queried; LIVE/CANCELLED aren't counted here).
  const livesCount = scheduledLives.length + endedLives.length

  const content = (
    <>
      <div className="flex flex-col gap-3 reveal d1">
        <StatsRow followerCount={followerCount} livesCount={livesCount} />
      </div>

      <div className="flex flex-col gap-3 mt-7 reveal d2">
        <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-(--ink-0)">Schedule</span>
        <DayPicker days={days} selected={selectedDay} onSelect={setSelectedDay} />
        {nextLive ? <NextLiveCard live={nextLive} /> : <ScheduleEmptyState />}
      </div>

      <div className="mt-6 reveal d3">
        <Link href="/live/schedule" className="live-hub-schedule-cta">
          <span className="text-[16px] leading-none">＋</span>
          Programar Próximo Live
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-7 reveal d4">
        <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-(--ink-0)">Historial de Lives</span>
        <HistoryEmptyState />
      </div>
    </>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="home-top-nav">
          <HubHeader store={store} />
        </div>

        <div className="px-5 mt-5 pb-6">
          {content}
        </div>

        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {mounted && createPortal(
        <Link href="/live/setup" className="live-hub-fab lg:hidden" aria-label="Iniciar Live">
          🎥
        </Link>,
        document.body
      )}

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex flex-col stage screen-enter">
        <div className="sticky top-0 z-20 flex items-center justify-between px-12 py-5 border-b border-(--line) bg-(--bg-0)/85 backdrop-blur-xl">
          <HubHeader store={store} />
        </div>

        <div className="flex items-start justify-center py-10 px-8">
          <div className="w-full max-w-md">
            {content}
          </div>
        </div>
      </div>
    </>
  )
}
