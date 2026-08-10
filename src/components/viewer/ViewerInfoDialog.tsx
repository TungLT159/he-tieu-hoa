import { BookOpen } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createTranslator } from '@/lib/i18n'

import { getOrganInfo } from './organConfig'
import { useViewer } from './viewerContext'

const INFO_ORGAN_NODE_ORDER = [
  'mieng',
  'thuc_quan',
  'da_day',
  'ruot_non',
  'ruot_gia',
  'gan',
  'tui_mat',
  'tuy',
]

export function ViewerInfoDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'info'} onOpenChange={(open) => setActiveDialog(open ? 'info' : null)}>
      <DialogContent className="max-h-[80vh] max-w-2xl" closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            {t('viewer.info.title')}
          </DialogTitle>
          <DialogDescription>{t('viewer.info.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {INFO_ORGAN_NODE_ORDER.map((nodeName) => {
              const organ = getOrganInfo(nodeName)
              if (!organ) return null

              return (
                <section key={organ.nodeName} className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold">{t(organ.displayNameKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(organ.descriptionKey)}</p>
                </section>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
