import { Question } from '@phosphor-icons/react'

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

export function ViewerQuizDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'quiz'} onOpenChange={(open) => setActiveDialog(open ? 'quiz' : null)}>
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Question className="h-5 w-5" aria-hidden="true" />
            {t('viewer.quiz.title')}
          </DialogTitle>
          <DialogDescription>{t('viewer.quiz.placeholder')}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
