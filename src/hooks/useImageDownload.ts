import { useCallback, useState } from 'react'

import { downloadImage } from '@/services/imageDownload'

export function useImageDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = useCallback(async (url: string, filename?: string) => {
    setIsDownloading(true)
    setError(null)
    try {
      const name = filename ?? `ai-image-${Date.now()}.png`
      await downloadImage(url, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return { download, isDownloading, error }
}
