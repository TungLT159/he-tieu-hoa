import { useEffect, useRef, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useImageDownload } from '@/hooks/useImageDownload'
import { createTranslator } from '@/lib/i18n'
import { generateImage } from '@/services/ai'

import { ImageLightbox } from './ImageLightbox'
import { ImageSkeleton } from './ImageSkeleton'

interface GeneratedImage {
  requestId: number
  url: string
  prompt: string
}

export function ImageContent() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [imageInput, setImageInput] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const [failedImagePrompt, setFailedImagePrompt] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isMountedRef = useRef(false)
  const imageRequestIdRef = useRef(0)
  const { download, isDownloading, error: downloadError } = useImageDownload()

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const downloadGeneratedImage = (url: string) => {
    if (isDownloading) return
    void download(url, `ai-image-${Date.now()}.png`)
  }

  const generate = async (retryPrompt?: string) => {
    const prompt = retryPrompt ?? imageInput.trim()
    if (!prompt || isImageLoading) return

    const requestId = imageRequestIdRef.current + 1
    imageRequestIdRef.current = requestId
    setIsImageLoading(true)
    setHasImageError(false)
    setFailedImagePrompt(null)
    setGeneratedImage(null)
    setLightboxOpen(false)

    try {
      const url = await generateImage(prompt)
      if (!isMountedRef.current || requestId !== imageRequestIdRef.current) return
      setGeneratedImage({ requestId, url, prompt })
    } catch (error) {
      if (!isMountedRef.current || requestId !== imageRequestIdRef.current) return
      console.error(error)
      setFailedImagePrompt(prompt)
      setHasImageError(true)
    } finally {
      if (isMountedRef.current && requestId === imageRequestIdRef.current) {
        setIsImageLoading(false)
      }
    }
  }

  const imageCanGenerate = imageInput.trim().length > 0 && !isImageLoading

  return (
    <div data-testid="chatbot-image-content" className="flex h-full flex-col gap-3 overflow-hidden text-sm text-muted-foreground">
      <div
        role="status"
        aria-live="polite"
        data-testid="chatbot-image-status"
        className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border p-3"
      >
        {isImageLoading ? <ImageSkeleton label={t('viewer.chatbot.imageLoading')} /> : null}
        {generatedImage ? (
          <div className="space-y-2">
            <button
              type="button"
              className="block w-full rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-label={t('viewer.chatbot.openImage', { prompt: generatedImage.prompt })}
              title={t('viewer.chatbot.openImage', { prompt: generatedImage.prompt })}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                key={generatedImage.requestId}
                className="w-full rounded-md border border-border object-contain animate-in fade-in duration-500"
                src={generatedImage.url}
                alt={generatedImage.prompt}
                onError={() => {
                  if (generatedImage.requestId === imageRequestIdRef.current) {
                    setFailedImagePrompt(generatedImage.prompt)
                    setGeneratedImage(null)
                    setLightboxOpen(false)
                    setHasImageError(true)
                  }
                }}
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDownloading}
              onClick={() => downloadGeneratedImage(generatedImage.url)}
            >
              {t('viewer.chatbot.download')}
            </Button>
          </div>
        ) : null}
      </div>

      <form
        className="flex shrink-0 gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void generate()
        }}
      >
        <Input
          value={imageInput}
          aria-label={t('viewer.chatbot.imagePlaceholder')}
          placeholder={t('viewer.chatbot.imagePlaceholder')}
          onChange={(event) => setImageInput(event.target.value)}
        />
        <Button type="submit" disabled={!imageCanGenerate}>
          {t('viewer.chatbot.imagePrompt')}
        </Button>
      </form>

      {hasImageError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{t('viewer.chatbot.error')}</span>
            {failedImagePrompt ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void generate(failedImagePrompt)}
              >
                {t('viewer.chatbot.regenerate')}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {downloadError ? (
        <Alert variant="destructive">
          <AlertDescription>{t('viewer.chatbot.downloadError')}</AlertDescription>
        </Alert>
      ) : null}

      {generatedImage ? (
        <ImageLightbox
          open={lightboxOpen}
          imageUrl={generatedImage.url}
          prompt={generatedImage.prompt}
          downloadLabel={t('viewer.chatbot.download')}
          onClose={() => setLightboxOpen(false)}
          onDownload={() => downloadGeneratedImage(generatedImage.url)}
        />
      ) : null}
    </div>
  )
}
