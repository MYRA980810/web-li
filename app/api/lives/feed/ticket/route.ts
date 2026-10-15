// Issues a single-use stream ticket for the buyer lives feed (handoff §15.2).
// A Route Handler (not a Server Action): it reads the httpOnly session cookie,
// can persist a refreshed session, and the browser then opens the stream
// directly against the backend with `X-Stream-Ticket`.

import { cookies } from 'next/headers'
import { API, fetchWithAuth, getToken, isNextInternalError } from '@/lib/fetchWithAuth'
import { isSessionRetryError } from '@/lib/auth/sessionRetry'
import { parseRetryAfterMs } from '@/lib/liveFeed/streamPolicy'
import type { StreamTicketResult } from '@/lib/liveFeed/types'

const BACKEND_TIMEOUT_MS = 5_000

function reply(result: StreamTicketResult, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(result, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

const retry = () => reply({ ok: false, reason: 'retry' }, 503)
const unauthenticated = () => reply({ ok: false, reason: 'unauthenticated' }, 401)

export async function POST(): Promise<Response> {
  const token = await getToken()
  if (!token) {
    // The middleware refreshes a missing/expired session first. A refresh token
    // still present means that refresh was transient: retry, never a logout.
    const hasRefreshToken = (await cookies()).get('refresh_token') != null
    return hasRefreshToken ? retry() : unauthenticated()
  }

  let res: Response
  try {
    res = await fetchWithAuth(
      `${API}/api/lives/feed/stream-ticket`,
      { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS) },
      token,
    )
  } catch (err) {
    // 409 refresh-retry / 429 / 5xx / network on the refresh: not a logout.
    if (isSessionRetryError(err)) return retry()
    // fetchWithAuth's logout path (dead refresh token): cookies are already
    // cleared; answer JSON instead of letting a redirect reach a fetch() caller.
    if (isNextInternalError(err)) return unauthenticated()
    return retry()
  }

  if (res.ok) {
    let ticket: unknown
    try {
      ticket = ((await res.json()) as { ticket?: unknown }).ticket
    } catch {
      /* malformed body */
    }
    return typeof ticket === 'string' && ticket !== '' ? reply({ ok: true, ticket }, 200) : retry()
  }

  if (res.status === 401) return unauthenticated()
  if (res.status === 403) return reply({ ok: false, reason: 'forbidden' }, 403)
  if (res.status === 503) {
    // TICKET_STORE_UNAVAILABLE: infrastructure outage, never refresh or log out.
    const retryAfterMs = parseRetryAfterMs(res.headers.get('Retry-After'))
    return reply({ ok: false, reason: 'retry', retryAfterMs }, 503, {
      'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
    })
  }
  return retry()
}
