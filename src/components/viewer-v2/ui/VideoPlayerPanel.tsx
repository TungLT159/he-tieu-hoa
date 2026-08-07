import { useEffect, useState } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'

interface VideoPlayerPanelProps {
  onClose: () => void
}

export function VideoPlayerPanel({ onClose }: VideoPlayerPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [hasVideoError, setHasVideoError] = useState(false)
  const trackLabel = locale === 'vi' ? 'Tiếng Việt' : 'English'
  const trackLanguage = locale === 'vi' ? 'vi' : 'en'

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    fetch('/videos/he-tieu-hoa.mp4', { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (isActive && !controller.signal.aborted && !response.ok) setHasVideoError(true)
      })
      .catch((error: unknown) => {
        if (!isActive || controller.signal.aborted) return
        if (error instanceof DOMException && error.name === 'AbortError') return

        setHasVideoError(true)
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  return (
    <Card
      role="region"
      aria-label={t('viewer.menu.video')}
      className="absolute right-4 top-4 z-20 w-[min(28rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">{t('viewer.menu.video')}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>

        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          <video
            data-testid="learning-video"
            controls
            src="/videos/he-tieu-hoa.mp4"
            title={t('viewer.menu.video')}
            onError={() => setHasVideoError(true)}
            className="h-full w-full bg-black"
          >
            <track
              kind="captions"
              src="/videos/he-tieu-hoa.vtt"
              srcLang={trackLanguage}
              label={trackLabel}
              default
            />
            {t('viewer.video.fallback')}
          </video>
        </div>

        {hasVideoError ? (
          <p data-testid="learning-video-error" className="text-sm text-muted-foreground">
            {t('viewer.video.fallback')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
