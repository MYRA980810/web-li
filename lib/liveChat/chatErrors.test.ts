import { describe, expect, it } from 'vitest'
import {
  classifyChatTokenError,
  isSendForbiddenError,
  extractProblemCode,
  isTerminalChatStop,
  normalizeProblemCode,
  SEND_PENDING_MESSAGE,
  sendErrorMessage,
} from './chatErrors'

describe('extractProblemCode', () => {
  it('prefers the explicit code property', () => {
    expect(extractProblemCode({ code: 'CHAT_BANNED', type: 'https://livecomerce.com/errors/chat-banned' })).toBe('CHAT_BANNED')
  })

  it('falls back to the last segment of the problem type URI', () => {
    expect(extractProblemCode({ type: 'https://livecomerce.com/errors/live-not-active' })).toBe('live-not-active')
    expect(extractProblemCode({ type: 'https://livecomerce.com/errors/live-chat-room-not-available/' })).toBe(
      'live-chat-room-not-available',
    )
  })

  it('returns null for bodies without a usable code', () => {
    expect(extractProblemCode(null)).toBeNull()
    expect(extractProblemCode('oops')).toBeNull()
    expect(extractProblemCode({ type: 'about:blank' })).toBeNull()
    expect(extractProblemCode({ code: '' })).toBeNull()
  })
})

describe('normalizeProblemCode', () => {
  it('maps kebab type-URI slugs and UPPER_SNAKE codes to the same constant', () => {
    expect(normalizeProblemCode('live-not-active')).toBe('LIVE_NOT_ACTIVE')
    expect(normalizeProblemCode('LIVE_NOT_ACTIVE')).toBe('LIVE_NOT_ACTIVE')
    expect(normalizeProblemCode('chat-banned')).toBe('CHAT_BANNED')
    expect(normalizeProblemCode(null)).toBeNull()
  })
})

describe('classifyChatTokenError', () => {
  it('treats only 503 (and a network failure) as retryable', () => {
    expect(classifyChatTokenError(503, 'chat-provider-unavailable')).toBe('retryable')
    expect(classifyChatTokenError(503, 'CHAT_PROVIDER_UNAVAILABLE')).toBe('retryable')
    expect(classifyChatTokenError(0, null)).toBe('retryable')
    expect(classifyChatTokenError(500, 'chat-provider-misconfigured')).toBe('fatal')
  })

  it('stops on unknown live, inactive live and missing room in both code formats', () => {
    expect(classifyChatTokenError(404, 'live-not-found')).toBe('not-found')
    expect(classifyChatTokenError(404, 'LIVE_NOT_FOUND')).toBe('not-found')
    expect(classifyChatTokenError(403, 'live-not-active')).toBe('not-active')
    expect(classifyChatTokenError(403, 'LIVE_NOT_ACTIVE')).toBe('not-active')
    expect(classifyChatTokenError(409, 'live-chat-room-not-available')).toBe('room-unavailable')
    expect(classifyChatTokenError(409, 'LIVE_CHAT_ROOM_NOT_AVAILABLE')).toBe('room-unavailable')
    expect(classifyChatTokenError(409, 'invalid-live-state')).toBe('fatal')
  })

  it('never treats a 403 as a ban: bans now yield a receive-only token (canSend=false)', () => {
    expect(classifyChatTokenError(403, 'CHAT_BANNED')).toBe('fatal')
    expect(classifyChatTokenError(403, null)).toBe('fatal')
    expect(classifyChatTokenError(403, 'live-not-owned')).toBe('fatal')
  })

  it('treats everything else as a non-retryable failure', () => {
    expect(classifyChatTokenError(401, null)).toBe('fatal')
    expect(classifyChatTokenError(400, null)).toBe('fatal')
  })
})

describe('isTerminalChatStop', () => {
  it('is true for stops a reconnect can never fix', () => {
    for (const kind of ['not-active', 'room-unavailable', 'not-found', 'live-ended'] as const) {
      expect(isTerminalChatStop(kind)).toBe(true)
    }
    expect(isTerminalChatStop('fatal')).toBe(false)
    expect(isTerminalChatStop('retryable')).toBe(false)
  })
})

describe('sendErrorMessage', () => {
  it('maps a message-review denial (406) to a not-allowed message', () => {
    expect(sendErrorMessage({ id: 'e1', errorCode: 406, errorMessage: 'denied', requestId: 'r1' })).toBe(
      'Tu mensaje no está permitido',
    )
  })

  it('maps the review Reason token found in a 406 errorMessage', () => {
    const denied = (errorMessage: string) => sendErrorMessage({ id: 'e', errorCode: 406, errorMessage })
    expect(denied('Message rejected: EMAIL')).toBe('No se permiten correos electrónicos')
    expect(denied('LINK')).toBe('No se permiten enlaces')
    expect(denied('reason=PHONE')).toBe('No se permiten números de teléfono')
    expect(denied('BANNED_WORD')).toBe('Tu mensaje contiene palabras no permitidas')
    expect(denied('EMPTY')).toBe('Tu mensaje está vacío')
  })

  it('ignores tokens that are lowercase or part of a longer word', () => {
    const denied = (errorMessage: string) => sendErrorMessage({ id: 'e', errorCode: 406, errorMessage })
    expect(denied('email rejected')).toBe('Tu mensaje no está permitido')
    expect(denied('LINKS')).toBe('Tu mensaje no está permitido')
    expect(denied('NEW_REASON')).toBe('Tu mensaje no está permitido')
  })

  it('maps rate limiting and size errors', () => {
    expect(sendErrorMessage({ id: 'e', errorCode: 429, errorMessage: '' })).toBe('Estás enviando mensajes muy rápido')
    expect(sendErrorMessage({ id: 'e', errorCode: 413, errorMessage: '' })).toBe('Tu mensaje es demasiado largo')
    expect(sendErrorMessage({ id: 'e', errorCode: 403, errorMessage: '' })).toBe('No puedes enviar mensajes en este chat')
  })

  it('falls back to a generic message for SDK exceptions and unknown values', () => {
    expect(sendErrorMessage(new Error('Room is not connected'))).toBe('No se pudo enviar tu mensaje')
    expect(sendErrorMessage(undefined)).toBe('No se pudo enviar tu mensaje')
    expect(sendErrorMessage({ id: 'e', errorCode: 500, errorMessage: '' })).toBe('No se pudo enviar tu mensaje')
  })
})

describe('isSendForbiddenError', () => {
  it('is true only for an IVS 403 ChatError (receive-only token)', () => {
    expect(isSendForbiddenError({ id: 'e', errorCode: 403, errorMessage: 'forbidden' })).toBe(true)
    expect(isSendForbiddenError({ id: 'e', errorCode: 406, errorMessage: '' })).toBe(false)
    expect(isSendForbiddenError(new Error('Room is not connected'))).toBe(false)
    expect(isSendForbiddenError(null)).toBe(false)
  })
})

describe('SEND_PENDING_MESSAGE', () => {
  it('is a soft notice, distinct from the failure messages', () => {
    expect(SEND_PENDING_MESSAGE).toBe('Tu mensaje puede tardar en aparecer')
  })
})
