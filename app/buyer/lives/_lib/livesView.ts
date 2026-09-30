import { storeInitials } from '@/lib/visualFallbacks'

// Pure, framework-free helpers for the buyer lives explorer. Everything that
// depends on "now" takes it as an argument so results are deterministic.

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']

type LiveLike = { id: string; title: string; sellerName: string | null }

// ─── Formatting ───────────────────────────────────────────────────────────────

/** 862 → "862", 1340 → "1,3k", 12000 → "12k", 1_250_000 → "1,3M" (es-style decimal comma). */
export function formatCompactCount(value: number): string {
  const n = Math.max(0, Math.floor(value))
  if (n < 1000) return String(n)
  const [divisor, suffix] = n < 1_000_000 ? [1000, 'k'] : [1_000_000, 'M']
  const scaled = Math.round((n / divisor) * 10) / 10
  const text = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1).replace('.', ',')
  return `${text}${suffix}`
}

export function sellerInitials(sellerName: string | null): string {
  return storeInitials(sellerName ?? 'Tienda')
}

export function sellerLabel(sellerName: string | null): string {
  return sellerName ?? 'Tienda'
}

/** "20:30" in the viewer's local time. */
export function formatClock(timestamp: number): string {
  const d = new Date(timestamp)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "24 sept" */
export function formatDayDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayOffset(dayStart: number, now: number): number {
  // Rounding absorbs the ±1h DST shift between two local midnights.
  return Math.round((dayStart - startOfDay(now)) / DAY_MS)
}

/** "Hoy" / "Mañana" / weekday name within the next week / "3 oct" afterwards. */
export function dayLabel(dayStart: number, now: number): string {
  const offset = dayOffset(dayStart, now)
  if (offset <= 0) return 'Hoy'
  if (offset === 1) return 'Mañana'
  if (offset < 7) return WEEKDAYS[new Date(dayStart).getDay()]!
  return formatDayDate(dayStart)
}

/** Compact variant for slot chips: "Hoy" / "Mañ" / "Vie" / "3 oct". */
export function shortDayLabel(dayStart: number, now: number): string {
  const offset = dayOffset(dayStart, now)
  if (offset <= 0) return 'Hoy'
  if (offset === 1) return 'Mañ'
  if (offset < 7) return WEEKDAYS_SHORT[new Date(dayStart).getDay()]!
  return formatDayDate(dayStart)
}

export function isToday(dayStart: number, now: number): boolean {
  return dayOffset(dayStart, now) <= 0
}

export type SlotCountdown = {
  label: string
  /** 0..1 elapsed fraction of the final hour; null when more than an hour away. */
  progress: number | null
}

/** "23:02" (mm:ss) under an hour, "En 1 h 23 min" / "En 45 min" / "En 2 d 3 h" beyond. */
export function slotCountdown(startsAt: number, now: number): SlotCountdown {
  const remaining = startsAt - now
  if (remaining <= 0) return { label: 'Por comenzar', progress: 1 }

  if (remaining < HOUR_MS) {
    const totalSeconds = Math.floor(remaining / 1000)
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
    const ss = String(totalSeconds % 60).padStart(2, '0')
    return { label: `${mm}:${ss}`, progress: 1 - remaining / HOUR_MS }
  }

  if (remaining < DAY_MS) {
    const hours = Math.floor(remaining / HOUR_MS)
    const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS)
    return { label: minutes > 0 ? `En ${hours} h ${minutes} min` : `En ${hours} h`, progress: null }
  }

  const days = Math.floor(remaining / DAY_MS)
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS)
  return { label: hours > 0 ? `En ${days} d ${hours} h` : `En ${days} d`, progress: null }
}

// ─── Search ───────────────────────────────────────────────────────────────────

/** Client-side text search over loaded items (category filtering happens on the backend). */
export function searchLives<T extends LiveLike>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (q === '') return items
  return items.filter((item) => `${item.sellerName ?? ''} ${item.title}`.toLowerCase().includes(q))
}

// ─── Upcoming grouping (day → exact start time slot) ─────────────────────────

export type UpcomingSlotGroup<T> = {
  key: string
  startsAt: number
  items: T[]
}

export type UpcomingDayGroup<T> = {
  key: string
  dayStart: number
  total: number
  slots: UpcomingSlotGroup<T>[]
}

/** Groups upcoming lives by local calendar day, then by exact scheduled start
 * (minute precision). Output is chronological; input order within a slot is kept. */
export function groupUpcomingByDay<T extends { scheduledAt: string }>(items: T[]): UpcomingDayGroup<T>[] {
  const withTime = items
    .map((item, index) => ({ item, index, at: Math.floor(new Date(item.scheduledAt).getTime() / MINUTE_MS) * MINUTE_MS }))
    .filter((entry) => Number.isFinite(entry.at))
    .sort((a, b) => a.at - b.at || a.index - b.index)

  const days: UpcomingDayGroup<T>[] = []
  for (const { item, at } of withTime) {
    const dayStart = startOfDay(at)
    let day = days[days.length - 1]
    if (!day || day.dayStart !== dayStart) {
      day = { key: String(dayStart), dayStart, total: 0, slots: [] }
      days.push(day)
    }
    let slot = day.slots[day.slots.length - 1]
    if (!slot || slot.startsAt !== at) {
      slot = { key: String(at), startsAt: at, items: [] }
      day.slots.push(slot)
    }
    slot.items.push(item)
    day.total += 1
  }
  return days
}
