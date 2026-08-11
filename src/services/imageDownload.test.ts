import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { downloadImage } from './imageDownload'

const fetchMock = vi.fn()

describe('image download service', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:download-url')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    clickSpy = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('fetches an image and triggers a browser download', async () => {
    const blob = new Blob(['image'], { type: 'image/png' })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      blob: async () => blob,
    })

    await downloadImage('https://example.com/image.png', 'image.png')

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/image.png')
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:download-url')
    expect(document.body.querySelector('a')).toBeNull()
  })

  it('throws when the download response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(downloadImage('https://example.com/missing.png', 'missing.png')).rejects.toThrow(
      'Download failed: 404',
    )
    expect(createObjectURLSpy).not.toHaveBeenCalled()
  })

  it('removes the anchor and revokes the object URL when clicking throws', async () => {
    const blob = new Blob(['image'], { type: 'image/png' })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      blob: async () => blob,
    })
    clickSpy.mockImplementationOnce(() => {
      throw new Error('click failed')
    })

    await expect(downloadImage('https://example.com/image.png', 'image.png')).rejects.toThrow(
      'click failed',
    )
    expect(document.body.querySelector('a')).toBeNull()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:download-url')
  })
})
