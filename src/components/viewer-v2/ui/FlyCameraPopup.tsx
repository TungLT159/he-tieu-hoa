import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import { getOrganInfo } from '../organConfig'
import { useViewerV2 } from '../viewerV2Context'

const boundingBox = new THREE.Box3()
const organCenter = new THREE.Vector3()

export function FlyCameraPopup() {
  const { flyCameraOrganPopup, organNodes } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  if (!flyCameraOrganPopup) return null

  const organ = getOrganInfo(flyCameraOrganPopup)
  const meshes = organNodes.get(flyCameraOrganPopup)
  if (!organ || !meshes?.length) return null

  boundingBox.makeEmpty()
  for (const mesh of meshes) {
    boundingBox.expandByObject(mesh)
  }
  if (boundingBox.isEmpty()) return null

  boundingBox.getCenter(organCenter)

  return (
    <Html center position={organCenter} transform={false} zIndexRange={[20, 0]}>
      <Card className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))] translate-y-4 bg-card/95 py-0 shadow-lg backdrop-blur">
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold leading-none">{t(organ.displayNameKey)}</h2>
            <p className="text-sm text-muted-foreground">{t(organ.descriptionKey)}</p>
          </div>
          <Button size="sm" onClick={() => window.dispatchEvent(new Event('flycamera-advance'))}>
            {t('viewer.flyCamera.continue')}
          </Button>
        </CardContent>
      </Card>
    </Html>
  )
}
