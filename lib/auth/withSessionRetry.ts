import { isSessionRetryResult } from './sessionRetry'
import { sessionRetryLoginPath } from './sessionDecision'

const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 500
const JITTER_MS = 500

export type WithSessionRetryOptions = {
  /** Called once when every attempt returned the retry signal. Defaults to a hard navigation to /login. */
  onSessionLost?: () => void
  /** Injectable for tests. */
  random?: () => number
}

// The middleware keeps refresh_token on /login (only an `invalid` refresh may
// delete it), so the next protected navigation can still recover the session.
function goToLogin(): void {
  const { pathname, search } = window.location
  window.location.assign(sessionRetryLoginPath(`${pathname}${search}`))
}

/**
 * Client-side wrapper for server actions that may return the session retry
 * signal. Retries after 500–1000ms (jittered) up to 3 attempts in total; if
 * the session still cannot be refreshed it is treated as lost.
 */
export async function withSessionRetry<T>(fn: () => Promise<T>, options: WithSessionRetryOptions = {}): Promise<T> {
  const { onSessionLost = goToLogin, random = Math.random } = options
  let result = await fn()
  for (let attempt = 1; attempt < MAX_ATTEMPTS && isSessionRetryResult(result); attempt++) {
    const delay = BASE_DELAY_MS + Math.floor(random() * JITTER_MS)
    await new Promise((resolve) => setTimeout(resolve, delay))
    result = await fn()
  }
  if (isSessionRetryResult(result)) onSessionLost()
  return result
}
