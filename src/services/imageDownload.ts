export async function downloadImage(url: string, filename: string): Promise<void> {
  if (isTauriRuntime()) {
    await saveRemoteImageWithTauriDialog(url, filename)
    return
  }

  let response: Response

  try {
    response = await fetch(url)
  } catch {
    triggerDownload(url, filename)
    return
  }

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  try {
    triggerDownload(blobUrl, filename)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

async function saveRemoteImageWithTauriDialog(url: string, filename: string): Promise<void> {
  const [{ invoke }, { save }, { writeFile }] = await Promise.all([
    import('@tauri-apps/api/core'),
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ])
  const path = await save({
    defaultPath: filename,
    filters: [{ name: 'PNG image', extensions: ['png'] }],
    title: 'Save image',
  })

  if (!path) {
    return
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }
    const blob = await response.blob()
    const buffer = (await blob.arrayBuffer()) as ArrayBuffer
    const bytes = new Uint8Array(buffer)
    await writeFile(path, bytes)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Download failed:')) {
      throw error
    }
    await invoke('download_image_to_path', { path, url })
  }
}

function isTauriRuntime(): boolean {
  return '__TAURI__' in window || '__TAURI_INTERNALS__' in window
}

function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  try {
    document.body.appendChild(anchor)
    anchor.click()
  } finally {
    document.body.removeChild(anchor)
  }
}
