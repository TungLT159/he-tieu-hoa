import { ChatsCircle } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createTranslator } from '@/lib/i18n'

import { useViewer } from './viewerContext'

export function ViewerChatbot() {
  const { activeSheet, setActiveSheet } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Sheet open={activeSheet === 'chatbot'} onOpenChange={(open) => setActiveSheet(open ? 'chatbot' : null)}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]" closeLabel={t('common.close')}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChatsCircle className="h-5 w-5" aria-hidden="true" />
            {t('viewer.chatbot.title')}
          </SheetTitle>
          <SheetDescription>{t('viewer.chatbot.placeholderBody')}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
