// Typed "try again shortly" signal for a refresh that hit a transient backend
// result (409 refresh-retry, 429, 5xx, network). Isomorphic: server actions
// map the error to a plain result, client code inspects the result.

export const SESSION_RETRY_MESSAGE = 'Reconectando tu sesión, intentá de nuevo'

export type SessionRetryResult = { ok: false; reason: 'retry'; error: string }

export class SessionRetryError extends Error {
  constructor() {
    super('Session refresh is temporarily unavailable; retry the request')
    this.name = 'SessionRetryError'
  }
}

export function isSessionRetryError(err: unknown): err is SessionRetryError {
  return err instanceof SessionRetryError
}

export function sessionRetryResult(): SessionRetryResult {
  return { ok: false, reason: 'retry', error: SESSION_RETRY_MESSAGE }
}

export function isSessionRetryResult(value: unknown): value is SessionRetryResult {
  return (
    value != null &&
    typeof value === 'object' &&
    (value as { ok?: unknown }).ok === false &&
    (value as { reason?: unknown }).reason === 'retry'
  )
}
