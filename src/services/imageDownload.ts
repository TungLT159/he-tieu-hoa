export async function downloadImage(url: string, filename: string): Promise<void> {
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
