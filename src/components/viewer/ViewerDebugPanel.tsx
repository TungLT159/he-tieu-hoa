import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'
import type { ViewerMeshDebugInfo } from './viewerContext'

function MeshList({
  label,
  meshes,
  renderMesh,
}: {
  label: string
  meshes: ViewerMeshDebugInfo[]
  renderMesh: (mesh: ViewerMeshDebugInfo) => string
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{label}</h3>
      <ul aria-label={label} className="space-y-1 text-xs text-muted-foreground">
        {meshes.map((mesh) => (
          <li key={mesh.meshUuid}>{renderMesh(mesh)}</li>
        ))}
      </ul>
    </section>
  )
}

export function ViewerDebugPanel() {
  const { isDebugPanelOpen, lastClickedMeshName, modelMeshes, selectedOrgan } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  if (!isDebugPanelOpen) return null

  const mappedMeshes = modelMeshes.filter((mesh) => mesh.isSelectable)
  const unmappedMeshes = modelMeshes.filter((mesh) => !mesh.isSelectable && !mesh.isEmpty)
  const emptyMeshes = modelMeshes.filter((mesh) => mesh.isEmpty)
  const lastClickedMesh = modelMeshes.find((mesh) => mesh.meshName === lastClickedMeshName)

  return (
    <Card className="absolute bottom-4 right-4 z-10 w-[min(28rem,calc(100%-2rem))] bg-card/95 py-4 shadow-lg backdrop-blur">
      <CardHeader className="px-4">
        <CardTitle>{t('viewer.debug.title')}</CardTitle>
      </CardHeader>
      <ScrollArea className="max-h-[calc(100vh-10rem)]">
        <CardContent className="space-y-4 px-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-medium">{t('viewer.debug.selectedOrgan')}</dt>
            <dd className="text-muted-foreground">{selectedOrgan ?? t('viewer.debug.none')}</dd>
            <dt className="font-medium">{t('viewer.debug.lastClickedMesh')}</dt>
            <dd className="text-muted-foreground">{lastClickedMeshName ?? t('viewer.debug.none')}</dd>
            <dt className="font-medium">{t('viewer.debug.lastClickedOrgan')}</dt>
            <dd className="text-muted-foreground">
              {lastClickedMesh?.organName ?? t('viewer.debug.none')}
            </dd>
          </dl>
          <MeshList
            label={t('viewer.debug.mappedMeshes')}
            meshes={mappedMeshes}
            renderMesh={(mesh) =>
              `${mesh.meshName} | ${mesh.organName ?? t('viewer.debug.none')} | ${mesh.vertexCount}`
            }
          />
          <MeshList
            label={t('viewer.debug.unmappedMeshes')}
            meshes={unmappedMeshes}
            renderMesh={(mesh) => `${mesh.meshName} | ${mesh.vertexCount}`}
          />
          <MeshList
            label={t('viewer.debug.emptyMeshes')}
            meshes={emptyMeshes}
            renderMesh={(mesh) => `${mesh.meshName} | ${t('viewer.debug.empty')}`}
          />
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
