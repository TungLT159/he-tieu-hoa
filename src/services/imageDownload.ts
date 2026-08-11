export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = filename
  try {
    document.body.appendChild(anchor)
    anchor.click()
  } finally {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(blobUrl)
  }
}
