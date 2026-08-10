import { Sparkle } from '@phosphor-icons/react'

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

export function ViewerGenAIDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'genai'} onOpenChange={(open) => setActiveDialog(open ? 'genai' : null)}>
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5" aria-hidden="true" />
            {t('viewer.genai.title')}
          </DialogTitle>
          <DialogDescription>{t('viewer.genai.placeholder')}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
