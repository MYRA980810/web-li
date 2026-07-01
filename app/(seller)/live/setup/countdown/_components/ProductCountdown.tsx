'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  durationSeconds: number
  onExpire?: () => void
}

export function ProductCountdown({ durationSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(durationSeconds)
    if (durationSeconds <= 0) return
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [durationSeconds])

  useEffect(() => {
    if (remaining === 0) onExpireRef.current?.()
  }, [remaining])

  const pct      = durationSeconds > 0 ? (remaining / durationSeconds) * 100 : 0
  const isUrgent = remaining <= 5 && remaining > 0
  const isDone   = remaining === 0

  return (
    <div className="product-countdown-wrap">
      <div
        className={`product-countdown-bar${isUrgent ? ' urgent' : ''}${isDone ? ' done' : ''}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`product-countdown-label${isUrgent ? ' urgent' : ''}${isDone ? ' done' : ''}`}>
        {isDone ? 'TIEMPO' : `${remaining}s`}
      </span>
    </div>
  )
}
