import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('apiRequest', () => {
  it('returns parsed json on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ok: true })
    })) as unknown as typeof fetch)

    await expect(apiRequest<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true })
  })

  it('throws the backend message on error response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad request' })
    })) as unknown as typeof fetch)

    await expect(apiRequest('/health')).rejects.toThrow('Bad request')
  })

  it('returns text when parseAsText is enabled', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => 'plain text'
    })) as unknown as typeof fetch)

    await expect(apiRequest<string>('/health', { parseAsText: true })).resolves.toBe('plain text')
  })
})
