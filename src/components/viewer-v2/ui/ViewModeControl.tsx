import { CrosshairSimple } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTranslator } from '@/lib/i18n'

import { useViewerV2 } from '../viewerV2Context'
import type { ViewMode } from '../viewerV2Context'

const VIEW_MODE_OPTIONS: ViewMode[] = ['3d', '2d']

export function ViewModeControl() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { requestViewReset, setViewMode, viewMode } = useViewerV2()

  return (
    <div
      data-tutorial-target="view-mode"
      className="absolute right-4 top-4 z-20 flex items-center gap-3 rounded-lg border border-border/70 bg-background/90 px-3 py-2 shadow-lg backdrop-blur"
    >
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        data-tutorial-target="view-reset"
        aria-label={t('viewer.returnToOverview')}
        title={t('viewer.returnToOverview')}
        onClick={requestViewReset}
      >
        <CrosshairSimple aria-hidden />
      </Button>
      <span className="text-sm font-medium text-foreground">{t('viewer.viewMode.title')}</span>
      <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <SelectTrigger aria-label={t('viewer.viewMode.title')} size="sm" className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {VIEW_MODE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`viewer.viewMode.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
