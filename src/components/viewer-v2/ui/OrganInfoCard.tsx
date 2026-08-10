import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'

import { getOrganInfo } from '../organConfig'
import { useViewerV2 } from '../viewerV2Context'

export function OrganInfoCard() {
  const { selectedOrgan } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  if (!selectedOrgan) return null

  const organ = getOrganInfo(selectedOrgan)
  if (!organ) return null

  return (
    <Card className="absolute bottom-4 left-4 z-10 w-[min(22rem,calc(100%-2rem))] bg-card/95 shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle>{t(organ.displayNameKey)}</CardTitle>
        <CardDescription>{t(organ.descriptionKey)}</CardDescription>
      </CardHeader>
    </Card>
  )
}
