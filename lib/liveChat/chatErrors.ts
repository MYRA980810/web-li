// Error classification for the IVS chat token endpoint and for IVS Chat send
// rejections. Pure, so it can be shared by server actions and client code.

/** Backend ProblemDetail codes relevant to the chat token endpoint, in the
 * normalized UPPER_SNAKE form (see normalizeProblemCode). */
export const LIVE_NOT_ACTIVE_CODE = 'LIVE_NOT_ACTIVE'
export const LIVE_NOT_FOUND_CODE = 'LIVE_NOT_FOUND'
export const CHAT_ROOM_NOT_AVAILABLE_CODE = 'LIVE_CHAT_ROOM_NOT_AVAILABLE'
export const CHAT_PROVIDER_UNAVAILABLE_CODE = 'CHAT_PROVIDER_UNAVAILABLE'

export type ChatTokenErrorKind =
  | 'retryable'
  | 'not-found'
  | 'not-active'
  | 'room-unavailable'
  | 'fatal'

/** Why a chat transport stopped: a non-retryable token error or the live ending. */
export type ChatStopKind = Exclude<ChatTokenErrorKind, 'retryable'> | 'live-ended'

/** Stops a reconnect can never fix. 'fatal' is not terminal: it is retried
 * when the device comes back online or the tab becomes visible. */
export function isTerminalChatStop(kind: ChatTokenErrorKind | 'live-ended'): boolean {
  return kind !== 'fatal' && kind !== 'retryable'
}

/** The backend sends UPPER_SNAKE `code`s (LIVE_NOT_ACTIVE) and, for older errors,
 * only a kebab-case `type` URI slug (live-not-active): compare both as UPPER_SNAKE. */
export function normalizeProblemCode(code: string | null): string | null {
  return code ? code.trim().toUpperCase().replace(/-/g, '_') : null
}

/**
 * The error code of a ProblemDetail body: the explicit `code` property when the
 * backend sets one (e.g. LIVE_NOT_ACTIVE), else the last segment of the `type` URI
 * (live-not-active and live-chat-room-not-available only carry it there).
 */
export function extractProblemCode(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const { code, type } = body as { code?: unknown; type?: unknown }
  if (typeof code === 'string' && code) return code
  if (typeof type !== 'string' || !type.includes('/')) return null
  const segment = type.replace(/\/+$/, '').split('/').pop()
  return segment ? segment : null
}

/**
 * Only 503 (AWS unavailable) is retryable; status 0 is a network failure of
 * the server action itself and is retried too. Every other failure stops the
 * chat — retrying it would only loop. A ban is never a token error: a banned
 * buyer gets a receive-only token (canSend=false), so an unknown 403 is 'fatal'.
 */
export function classifyChatTokenError(status: number, code: string | null): ChatTokenErrorKind {
  const normalized = normalizeProblemCode(code)
  if (status === 503 || status === 0) return 'retryable'
  if (status === 404) return 'not-found'
  if (status === 409) return normalized === CHAT_ROOM_NOT_AVAILABLE_CODE ? 'room-unavailable' : 'fatal'
  if (status === 403 && normalized === LIVE_NOT_ACTIVE_CODE) return 'not-active'
  return 'fatal'
}

/** IVS Chat Messaging error codes (amazon-ivs-chat-messaging `chatErrorCodes`). */
const IVS_FORBIDDEN = 403
const IVS_NOT_ACCEPTABLE = 406 // rejected by the message review handler
const IVS_PAYLOAD_TOO_LARGE = 413
const IVS_TOO_MANY_REQUESTS = 429

export const SEND_ERROR_GENERIC = 'No se pudo enviar tu mensaje'
/** The room didn't confirm in time: the message was probably sent and may
 * still show up, so the draft is not kept (resending would duplicate it). */
export const SEND_PENDING_MESSAGE = 'Tu mensaje puede tardar en aparecer'

function chatErrorCode(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null
  const code = (err as { errorCode?: unknown }).errorCode
  return typeof code === 'number' ? code : null
}

/** A send rejected for lack of the SEND_MESSAGE capability: the connection
 * uses a receive-only token (the user is banned from this chat). */
export function isSendForbiddenError(err: unknown): boolean {
  return chatErrorCode(err) === IVS_FORBIDDEN
}

const SEND_ERROR_NOT_ALLOWED = 'Tu mensaje no está permitido'

/** Reason tokens set by our message review Lambda. IVS carries the Reason
 * inside the 406 `errorMessage` (wrapper text undocumented), so match whole,
 * case-sensitive words; anything else falls back to the generic message. */
const REVIEW_REASON_MESSAGES: Record<string, string> = {
  BANNED_WORD: 'Tu mensaje contiene palabras no permitidas',
  EMAIL:       'No se permiten correos electrónicos',
  LINK:        'No se permiten enlaces',
  PHONE:       'No se permiten números de teléfono',
  EMPTY:       'Tu mensaje está vacío',
}
const REVIEW_REASON_PATTERN = /\b(BANNED_WORD|EMAIL|LINK|PHONE|EMPTY)\b/

function reviewDenialMessage(err: unknown): string {
  const text = (err as { errorMessage?: unknown }).errorMessage
  const reason = typeof text === 'string' ? REVIEW_REASON_PATTERN.exec(text)?.[1] : undefined
  return (reason && REVIEW_REASON_MESSAGES[reason]) || SEND_ERROR_NOT_ALLOWED
}

/** User-facing text for a rejected IVS `sendMessage` (a ChatError or a thrown Error). */
export function sendErrorMessage(err: unknown): string {
  switch (chatErrorCode(err)) {
    case IVS_NOT_ACCEPTABLE:
      return reviewDenialMessage(err)
    case IVS_TOO_MANY_REQUESTS:
      return 'Estás enviando mensajes muy rápido'
    case IVS_PAYLOAD_TOO_LARGE:
      return 'Tu mensaje es demasiado largo'
    case IVS_FORBIDDEN:
      return 'No puedes enviar mensajes en este chat'
    default:
      return SEND_ERROR_GENERIC
  }
}
