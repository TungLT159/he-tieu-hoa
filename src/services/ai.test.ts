import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_GENAI_PROMPT, chat, generateImage } from './ai'

const fetchMock = vi.fn()

describe('AI API service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('exports the default GenAI prompt', () => {
    expect(DEFAULT_GENAI_PROMPT).toBe('Giải thích về hệ tiêu hóa ở người')
  })

  it('posts chat text with required headers and body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'response text' }),
    })

    await chat('hello')

    expect(fetchMock).toHaveBeenCalledWith('https://ai.iit.vn/api/chat', {
      method: 'POST',
      headers: {
        headerKey: 'iit@123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'hello' }),
    })
  })

  it('resolves chat response data', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'chat result' }),
    })

    await expect(chat('question')).resolves.toBe('chat result')
  })

  it('throws when chat response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(chat('question')).rejects.toThrow('Chat request failed: 500')
  })

  it('throws when chat response is missing data', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    await expect(chat('question')).rejects.toThrow('Invalid chat response: missing data')
  })

  it('posts image generation text with required headers and body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/image.png' }),
    })

    await generateImage('draw this')

    expect(fetchMock).toHaveBeenCalledWith('https://ai.iit.vn/api/text-to-image', {
      method: 'POST',
      headers: {
        headerKey: 'iit@123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'draw this' }),
    })
  })

  it('resolves generated image URL', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/generated.png' }),
    })

    await expect(generateImage('draw this')).resolves.toBe('https://example.com/generated.png')
  })

  it('throws when image generation response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
    })

    await expect(generateImage('draw this')).rejects.toThrow('Image generation failed: 503')
  })

  it('throws when image generation response is missing imageUrl', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    await expect(generateImage('draw this')).rejects.toThrow(
      'Invalid image response: missing imageUrl',
    )
  })
})
