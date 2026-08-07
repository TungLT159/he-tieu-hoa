import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { getOrganInfo } from '../organConfig'
import { useViewerV2 } from '../viewerV2Context'

const boundingBox = new THREE.Box3()
const projectedCenter = new THREE.Vector3()

export function FlyCameraPopup() {
  const { flyCameraOrganPopup, organNodes } = useViewerV2()
  const { locale } = useStarterSettings()
  const { camera, gl } = useThree()
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

  boundingBox.getCenter(projectedCenter).project(camera)

  const width = gl.domElement.clientWidth || 1
  const height = gl.domElement.clientHeight || 1
  const left = ((projectedCenter.x + 1) / 2) * width
  const top = ((-projectedCenter.y + 1) / 2) * height

  return (
    <Card
      className="pointer-events-auto absolute z-20 w-[min(20rem,calc(100%-2rem))] -translate-x-1/2 translate-y-4 bg-card/95 py-0 shadow-lg backdrop-blur"
      style={{ left, top }}
    >
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold leading-none">{t(organ.displayNameKey)}</h2>
          <p className="text-sm text-muted-foreground">{t(organ.descriptionKey)}</p>
        </div>
        <Button size="sm" onClick={() => window.dispatchEvent(new Event('flycamera-advance'))}>
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}
