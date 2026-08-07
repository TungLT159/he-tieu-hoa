import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'

interface InfoPanelProps {
  onClose: () => void
}

const DETAIL_KEYS = ['viewer.info.details.mouth', 'viewer.info.details.stomach', 'viewer.info.details.intestines'] as const

export function InfoPanel({ onClose }: InfoPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const title = t('viewer.info.title')

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-info-panel-title"
      className="absolute right-4 top-4 z-20 w-[min(30rem,calc(100vw-2rem))] bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id="viewer-info-panel-title" className="text-sm font-semibold">
          {title}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{t('viewer.info.description')}</p>
        <div className="space-y-2">
          {DETAIL_KEYS.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
