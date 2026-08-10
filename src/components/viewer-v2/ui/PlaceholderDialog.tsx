import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTranslator, type TranslationKey } from '@/lib/i18n'

interface PlaceholderDialogProps {
  titleKey: TranslationKey
  placeholderKey?: TranslationKey
  onClose: () => void
}

export function PlaceholderDialog({ titleKey, placeholderKey, onClose }: PlaceholderDialogProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const titleId = `viewer-placeholder-dialog-${titleKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="absolute right-4 top-4 z-20 w-80 bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id={titleId} className="text-sm font-semibold">
          {t(titleKey)}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {placeholderKey ? t(placeholderKey) : t('viewer.chatbot.placeholderBody')}
        </p>
      </CardContent>
    </Card>
  )
}
