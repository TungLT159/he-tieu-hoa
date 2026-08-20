import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { downloadImage } from './imageDownload'

const fetchMock = vi.fn()
const saveMock = vi.fn()
const writeFileMock = vi.fn()
const invokeMock = vi.fn()

vi.mock('@tauri-apps/plugin-dialog', () => ({ save: saveMock }))
vi.mock('@tauri-apps/plugin-fs', () => ({ writeFile: writeFileMock }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: invokeMock }))

describe('image download service', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    Reflect.deleteProperty(window, '__TAURI__')
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
    vi.stubGlobal('fetch', fetchMock)
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:download-url')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    clickSpy = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy)
    saveMock.mockReset()
    writeFileMock.mockReset()
    invokeMock.mockReset()
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

  it('opens a save location dialog and writes the image in Tauri', async () => {
    const bytes = new Uint8Array([105, 109, 97, 103, 101])
    const blob = {
      arrayBuffer: async () => bytes.buffer,
      type: 'image/png',
    } as Blob
    Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      blob: async () => blob,
    })
    saveMock.mockResolvedValueOnce('C:\\Users\\tester\\Pictures\\image.png')

    await downloadImage('https://example.com/image.png', 'image.png')

    expect(saveMock).toHaveBeenCalledWith({
      defaultPath: 'image.png',
      filters: [{ name: 'PNG image', extensions: ['png'] }],
      title: 'Save image',
    })
    expect(writeFileMock).toHaveBeenCalledWith('C:\\Users\\tester\\Pictures\\image.png', bytes)
    expect(clickSpy).not.toHaveBeenCalled()
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
  })

  it('opens the Tauri save dialog before downloading external generated images', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    saveMock.mockResolvedValueOnce('C:\\Users\\tester\\Pictures\\image.png')
    invokeMock.mockResolvedValueOnce(null)

    await downloadImage('https://file.aiquickdraw.com/image.png', 'image.png')

    expect(saveMock).toHaveBeenCalledWith({
      defaultPath: 'image.png',
      filters: [{ name: 'PNG image', extensions: ['png'] }],
      title: 'Save image',
    })
    expect(invokeMock).toHaveBeenCalledWith('download_image_to_path', {
      path: 'C:\\Users\\tester\\Pictures\\image.png',
      url: 'https://file.aiquickdraw.com/image.png',
    })
    expect(clickSpy).not.toHaveBeenCalled()
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
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

  it('falls back to direct anchor download when fetching the image is blocked', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await downloadImage('https://file.aiquickdraw.com/image.png', 'image.png')

    const clickedAnchor = clickSpy.mock.instances[0] as HTMLAnchorElement | undefined
    expect(clickedAnchor).toBeDefined()
    expect(clickedAnchor?.href).toBe('https://file.aiquickdraw.com/image.png')
    expect(clickedAnchor?.download).toBe('image.png')
    expect(createObjectURLSpy).not.toHaveBeenCalled()
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()
    expect(document.body.querySelector('a')).toBeNull()
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
