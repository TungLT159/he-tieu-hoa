import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

export function GuidePage() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-foreground text-xl font-semibold">
        {t('menu.guidePlaceholder')}
      </h1>
    </div>
  )
}
