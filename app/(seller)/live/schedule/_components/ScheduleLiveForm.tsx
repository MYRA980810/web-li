'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Ambient } from '@/components/Ambient'
import { SellerBottomNav } from '@/components/SellerBottomNav'
import { createLive, uploadLiveThumbnail } from '@/lib/liveActions'
import { TimeWheel } from './TimeWheel'

const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

// Full 24h range for the hour wheel — the pill-row version capped this at
// 09:00–23:00 (evening live-selling hours); the wheel format makes a 24h
// range cheap to scan, so the range restriction is dropped.
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// 15-minute increments — deliberate product decision, same spirit as the
// hour-only granularity the pill-row version used. A 60-stop minute wheel
// is unnecessarily fussy to scroll in a compact iOS-style picker.
const MINUTES = [0, 15, 30, 45]

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

type CalendarCell =
  | { kind: 'empty' }
  | { kind: 'day'; day: number; disabled: boolean }

function buildCalendarCells(monthCursor: Date): CalendarCell[] {
  const year  = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const today = startOfToday()

  const cells: CalendarCell[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push({ kind: 'empty' })
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day)
    cells.push({ kind: 'day', day, disabled: cellDate < today })
  }
  return cells
}

type Props = { storeId: string | null }

export function ScheduleLiveForm({ storeId }: Props) {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle]                     = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [monthCursor, setMonthCursor]         = useState<Date>(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay]         = useState<number | null>(null)
  const [selectedHour, setSelectedHour]       = useState<number | null>(null)
  const [selectedMinute, setSelectedMinute]   = useState<number | null>(null)
  const [isLoading, setIsLoading]             = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  const currentMonthCursor = useMemo(() => startOfMonth(new Date()), [])
  const cells              = useMemo(() => buildCalendarCells(monthCursor), [monthCursor])
  const canGoPrevMonth     = monthCursor.getTime() > currentMonthCursor.getTime()

  function handlePrevMonth() {
    if (!canGoPrevMonth) return
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  function handleNextMonth() {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function handleRemoveThumbnail() {
    setThumbnailPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  const canSubmit =
    title.trim().length > 0 &&
    selectedDay !== null &&
    selectedHour !== null &&
    selectedMinute !== null &&
    !isLoading

  async function handleSubmit() {
    if (!canSubmit || selectedDay === null || selectedHour === null || selectedMinute === null) return

    setIsLoading(true)
    setError(null)

    let thumbnailUrl: string | undefined
    const file = fileRef.current?.files?.[0]
    if (file) {
      const upload = await uploadLiveThumbnail(file)
      if (!upload.ok) {
        setError(upload.error)
        setIsLoading(false)
        return
      }
      thumbnailUrl = upload.url
    }

    const scheduledAt = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      selectedDay,
      selectedHour,
      selectedMinute, 0, 0,
    ).toISOString()

    const result = await createLive({
      title:                  title.trim(),
      scheduledAt,
      thumbnailUrl,
      context:                storeId ? 'STORE' : 'SELLER_PROFILE',
      storeId:                storeId ?? undefined,
      displayDurationSeconds: 60,
    })

    if (!result.ok) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/live')
  }

  const monthLabel = `${MONTH_LABELS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`

  const formBody = (idSuffix: string) => (
    <>
      {/* Título del Live */}
      <div className="px-5 mt-6 reveal d1">
        <label className="store-form-label" htmlFor={`schedule-title${idSuffix}`}>
          Título del Live
        </label>
        <input
          id={`schedule-title${idSuffix}`}
          type="text"
          className="store-input"
          placeholder="Ej: Noche de Jazz & Neon"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Arte del Post */}
      <div className="px-5 mt-7 reveal d2">
        <label className="store-form-label">Arte del Post</label>
        {thumbnailPreview ? (
          <div className="img-picker-thumb-wrap">
            <Image
              src={thumbnailPreview}
              alt="Arte del post"
              width={96}
              height={96}
              className="img-picker-thumb"
              unoptimized={thumbnailPreview.startsWith('blob:')}
            />
            <button
              type="button"
              className="img-picker-remove-btn"
              onClick={handleRemoveThumbnail}
              disabled={isLoading}
              aria-label="Eliminar imagen"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="img-picker-empty-zone"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
          >
            <span className="text-[40px] opacity-40">📷</span>
            <span className="text-[12px] text-(--ink-3) font-medium">Subir Arte del Post</span>
            <span className="text-[10px] text-(--ink-4) mt-1">JPG, PNG o WebP · Máx. 5 MB</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbnailChange}
        />
      </div>

      {/* Fecha del Evento */}
      <div className="px-5 mt-7 reveal d3">
        <div className="schedule-live-month-row mb-3">
          <label className="store-form-label" style={{ marginBottom: 0 }}>
            Fecha del Evento
          </label>
          <div className="schedule-live-month-nav">
            <button
              type="button"
              className="schedule-live-month-btn"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth || isLoading}
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <span className="schedule-live-month-label">{monthLabel}</span>
            <button
              type="button"
              className="schedule-live-month-btn"
              onClick={handleNextMonth}
              disabled={isLoading}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>
        </div>

        <div className="schedule-live-calendar">
          <div className="schedule-live-weekdays">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={`${label}-${i}`} className="schedule-live-weekday">{label}</span>
            ))}
          </div>
          <div className="schedule-live-days">
            {cells.map((cell, i) =>
              cell.kind === 'empty' ? (
                <span key={`empty-${i}`} className="schedule-live-day empty" />
              ) : (
                <button
                  key={cell.day}
                  type="button"
                  className={`schedule-live-day${cell.day === selectedDay ? ' selected' : ''}`}
                  onClick={() => setSelectedDay(cell.day)}
                  disabled={cell.disabled || isLoading}
                  aria-pressed={cell.day === selectedDay}
                  aria-label={`${cell.day} de ${monthLabel}`}
                >
                  {cell.day}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Hora de Inicio */}
      <div className="px-5 mt-7 reveal d4">
        <label className="store-form-label">Hora de Inicio</label>
        <div className="schedule-live-time-wheel-wrap">
          <div className="schedule-live-time-wheel-band" aria-hidden="true" />
          <div className="schedule-live-time-wheel-cols">
            <TimeWheel
              values={HOURS}
              selected={selectedHour}
              onSelect={setSelectedHour}
              formatValue={formatTwoDigits}
              disabled={isLoading}
              ariaLabel="Hora"
            />
            <span className="schedule-live-time-wheel-sep" aria-hidden="true">:</span>
            <TimeWheel
              values={MINUTES}
              selected={selectedMinute}
              onSelect={setSelectedMinute}
              formatValue={formatTwoDigits}
              disabled={isLoading}
              ariaLabel="Minuto"
            />
          </div>
        </div>
      </div>

      {/* Recordatorio Automático */}
      <div className="px-5 mt-7 reveal d5">
        <div className="glass schedule-live-reminder-card">
          <span className="schedule-live-reminder-icon" aria-hidden="true">🔔</span>
          <div>
            <p className="schedule-live-reminder-title">Recordatorio Automático</p>
            <p className="schedule-live-reminder-text">
              Notificaremos a tus seguidores 15 minutos antes de empezar.
            </p>
          </div>
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="px-5 mt-4">
          <p className="text-[13px] text-red-400 font-medium leading-snug">{error}</p>
        </div>
      )}

      {/* Submit — sits in normal document flow (see note in ScheduleLiveForm) */}
      <div className="px-5 mt-7">
        <button
          type="button"
          className="live-start-btn"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isLoading ? 'Programando...' : 'Programar Live'}
        </button>
      </div>

      <div className="h-16" />
    </>
  )

  return (
    <>
      <Ambient />

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden stage screen-enter">
        <div className="store-back-header">
          <Link href="/live" className="store-back-btn shrink-0" aria-label="Volver">
            ←
          </Link>
          <span className="flex-1 min-w-0 truncate text-center font-display font-bold text-[15px] text-(--ink-0) tracking-[0.06em] uppercase px-2">
            Programar Live
          </span>
          <button
            type="button"
            className="schedule-live-header-btn shrink-0"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Programar
          </button>
        </div>

        {formBody('-m')}

        <SellerBottomNav active="home" />
        <div className="h-24" />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:block stage screen-enter">
        <div className="max-w-lg mx-auto w-full">

          <div className="live-setup-nav">
            <Link href="/live" className="store-back-btn shrink-0" aria-label="Volver">
              ←
            </Link>
            <span className="live-setup-nav-title flex-1 min-w-0 truncate text-center px-2">Programar Live</span>
            <button
              type="button"
              className="schedule-live-header-btn shrink-0"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Programar
            </button>
          </div>

          {formBody('-d')}
        </div>

        <SellerBottomNav active="home" />
      </div>
    </>
  )
}
