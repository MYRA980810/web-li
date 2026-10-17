import { describe, expect, it } from 'vitest'
import { MAX_PLAYBACK_RETRIES, isRetryablePlaybackError, nextRetryDelay } from './playbackRetry'

const noJitter = () => 0.5

describe('nextRetryDelay', () => {
  it('backs off exponentially from 2s', () => {
    expect(nextRetryDelay(0, noJitter)).toBe(2000)
    expect(nextRetryDelay(1, noJitter)).toBe(4000)
    expect(nextRetryDelay(2, noJitter)).toBe(8000)
  })

  it('stops once the retries are exhausted', () => {
    expect(MAX_PLAYBACK_RETRIES).toBe(3)
    expect(nextRetryDelay(3, noJitter)).toBeNull()
    expect(nextRetryDelay(10, noJitter)).toBeNull()
  })

  it('applies at most ±20% jitter', () => {
    expect(nextRetryDelay(0, () => 0)).toBe(1600)
    expect(nextRetryDelay(0, () => 0.999999)).toBeLessThanOrEqual(2400)
    expect(nextRetryDelay(0, () => 0.999999)).toBeGreaterThan(2390)
  })

  it('rejects a negative attempt index', () => {
    expect(nextRetryDelay(-1, noJitter)).toBeNull()
  })
})

describe('isRetryablePlaybackError', () => {
  it('retries transient errors', () => {
    for (const type of ['ErrorNetwork', 'ErrorNetworkIO', 'ErrorTimeout', 'ErrorNotAvailable', 'Error', 'ErrorNoSource']) {
      expect(isRetryablePlaybackError(type)).toBe(true)
    }
  })

  it('does not retry authorization or unsupported-format errors', () => {
    expect(isRetryablePlaybackError('ErrorAuthorization')).toBe(false)
    expect(isRetryablePlaybackError('ErrorNotSupported')).toBe(false)
  })
})
