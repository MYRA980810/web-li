// Retry policy for fatal IVS player errors. IVS ERROR events are fatal (the
// player goes IDLE), but network/timeout/404 failures are often transient
// while the live is still on air, so the player is recreated with bounded
// exponential backoff. Error types are the IVS `ErrorType` string values,
// kept as literals so this module doesn't import the SDK.

export const MAX_PLAYBACK_RETRIES = 3
const BASE_DELAY_MS = 2000
const JITTER_RATIO = 0.2

// Retrying can't fix these: the stream is forbidden or unplayable here.
const NON_RETRYABLE_ERRORS = new Set(['ErrorAuthorization', 'ErrorNotSupported'])

export function isRetryablePlaybackError(errorType: string): boolean {
  return !NON_RETRYABLE_ERRORS.has(errorType)
}

/**
 * Delay before retry number `attempt` (0-based: 0 = first retry), or null
 * when retries are exhausted. 2s → 4s → 8s, each with ±20% jitter so many
 * viewers dropped by the same blip don't reconnect in lockstep.
 */
export function nextRetryDelay(attempt: number, random: () => number = Math.random): number | null {
  if (attempt < 0 || attempt >= MAX_PLAYBACK_RETRIES) return null
  const base = BASE_DELAY_MS * 2 ** attempt
  const jitter = (random() * 2 - 1) * JITTER_RATIO
  return Math.round(base * (1 + jitter))
}
