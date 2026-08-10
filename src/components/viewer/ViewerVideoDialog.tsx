import { Play } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createTranslator } from '@/lib/i18n'

import { useViewer } from './viewerContext'

export function ViewerVideoDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'video'} onOpenChange={(open) => setActiveDialog(open ? 'video' : null)}>
      <DialogContent closeLabel={t('common.close')} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" aria-hidden="true" />
            {t('viewer.menu.video')}
          </DialogTitle>
          <DialogDescription>{t('viewer.video.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <video
            className="aspect-video w-full rounded-lg border bg-muted"
            controls
            preload="metadata"
            src="/videos/learning.mp4"
            title={t('viewer.menu.video')}
          >
            {t('viewer.video.fallback')}
          </video>
          <p className="text-sm text-muted-foreground">{t('viewer.video.placeholder')}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
