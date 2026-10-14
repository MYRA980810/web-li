import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionRetryResult } from './sessionRetry'
import { withSessionRetry } from './withSessionRetry'

type Result = { ok: true; value: number } | { ok: false; error: string } | ReturnType<typeof sessionRetryResult>

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('withSessionRetry', () => {
  it('returns the first non-retry result without waiting', async () => {
    const fn = vi.fn<() => Promise<Result>>().mockResolvedValue({ ok: true, value: 1 })
    const onSessionLost = vi.fn()
    await expect(withSessionRetry(fn, { onSessionLost })).resolves.toEqual({ ok: true, value: 1 })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(onSessionLost).not.toHaveBeenCalled()
  })

  it('does not retry ordinary failures', async () => {
    const fn = vi.fn<() => Promise<Result>>().mockResolvedValue({ ok: false, error: 'boom' })
    await expect(withSessionRetry(fn, { onSessionLost: vi.fn() })).resolves.toEqual({ ok: false, error: 'boom' })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries a retry signal after 500–1000ms and returns the later success', async () => {
    const fn = vi.fn<() => Promise<Result>>()
      .mockResolvedValueOnce(sessionRetryResult())
      .mockResolvedValueOnce({ ok: true, value: 2 })
    const onSessionLost = vi.fn()

    const promise = withSessionRetry(fn, { onSessionLost, random: () => 0 })
    await vi.advanceTimersByTimeAsync(499)
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(2)

    await expect(promise).resolves.toEqual({ ok: true, value: 2 })
    expect(onSessionLost).not.toHaveBeenCalled()
  })

  it('jitter stretches the delay up to 1000ms', async () => {
    const fn = vi.fn<() => Promise<Result>>()
      .mockResolvedValueOnce(sessionRetryResult())
      .mockResolvedValueOnce({ ok: true, value: 3 })

    const promise = withSessionRetry(fn, { onSessionLost: vi.fn(), random: () => 0.999 })
    await vi.advanceTimersByTimeAsync(990)
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(10)
    expect(fn).toHaveBeenCalledTimes(2)
    await expect(promise).resolves.toEqual({ ok: true, value: 3 })
  })

  it('gives up after 3 attempts and treats it as session loss', async () => {
    const fn = vi.fn<() => Promise<Result>>().mockResolvedValue(sessionRetryResult())
    const onSessionLost = vi.fn()

    const promise = withSessionRetry(fn, { onSessionLost, random: () => 0 })
    await vi.advanceTimersByTimeAsync(5000)

    await expect(promise).resolves.toEqual(sessionRetryResult())
    expect(fn).toHaveBeenCalledTimes(3)
    expect(onSessionLost).toHaveBeenCalledTimes(1)
  })
})
