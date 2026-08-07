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
          <video data-testid="learning-video" controls src="/videos/he-tieu-hoa.mp4" className="h-full w-full bg-black">
            <track kind="captions" src="/videos/he-tieu-hoa.vtt" label={t('viewer.menu.video')} default />
            {t('viewer.video.fallback')}
          </video>
        </div>
      </CardContent>
    </Card>
  )
}
