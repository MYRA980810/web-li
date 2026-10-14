import { isSessionRetryResult } from './sessionRetry'

const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 500
const JITTER_MS = 500

export type WithSessionRetryOptions = {
  /** Called once when every attempt returned the retry signal. Defaults to a hard navigation to /login. */
  onSessionLost?: () => void
  /** Injectable for tests. */
  random?: () => number
}

function goToLogin(): void {
  window.location.assign('/login')
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
