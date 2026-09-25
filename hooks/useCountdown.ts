'use client'

import { useState, useSyncExternalStore } from 'react'

type Clock = {
  subscribe: (onTick: () => void) => () => void
  getSnapshot: () => number
}

function createClock(intervalMs: number): Clock {
  let now = Date.now()
  return {
    subscribe(onTick) {
      now = Date.now()
      const id = window.setInterval(() => {
        now = Date.now()
        onTick()
      }, intervalMs)
      return () => window.clearInterval(id)
    },
    getSnapshot: () => now,
  }
}

const getServerSnapshot = (): null => null

/**
 * Shared ticking clock for countdown UIs. Call it ONCE per list/timeline and
 * pass `now` down, so a whole timeline runs on a single interval instead of
 * one per card.
 *
 * Returns `null` during SSR and hydration (server and client clocks and time
 * zones differ), then the current epoch ms, refreshed every `intervalMs`.
 */
export function useCountdown(intervalMs = 1000): number | null {
  const [clock] = useState(() => createClock(intervalMs))
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, getServerSnapshot)
}
