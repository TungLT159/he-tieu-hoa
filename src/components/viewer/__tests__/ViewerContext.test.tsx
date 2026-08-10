import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { ViewerProvider } from '../ViewerContext.tsx'
import { useViewer } from '../viewerContext'

function ModelMeshRegistrationProbe() {
  const { modelMeshes, registerModelMesh } = useViewer()

  useEffect(() => {
    registerModelMesh({
      meshUuid: 'first-mesh',
      meshName: 'digestive_system003',
      organName: 'da_day',
      vertexCount: 24,
      isSelectable: true,
      isEmpty: false,
    })
    registerModelMesh({
      meshUuid: 'second-mesh',
      meshName: 'digestive_system003',
      organName: 'da_day',
      vertexCount: 12,
      isSelectable: true,
      isEmpty: false,
    })
  }, [registerModelMesh])

  return <output aria-label="mesh count">{modelMeshes.length}</output>
}

function OrganNodeRegistrationProbe() {
  const { organNodes, registerOrganNode } = useViewer()

  useEffect(() => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    registerOrganNode('da_day', mesh)
    registerOrganNode('da_day', mesh)
  }, [registerOrganNode])

  return <output aria-label="organ mesh count">{organNodes.get('da_day')?.length ?? 0}</output>
}

describe('ViewerProvider', () => {
  it('keeps debug rows for meshes with the same name and different uuids', async () => {
    render(
      <ViewerProvider>
        <ModelMeshRegistrationProbe />
      </ViewerProvider>,
    )

    expect(await screen.findByLabelText('mesh count')).toHaveTextContent('2')
  })

  it('does not duplicate the same organ mesh instance', async () => {
    render(
      <ViewerProvider>
        <OrganNodeRegistrationProbe />
      </ViewerProvider>,
    )

    expect(await screen.findByLabelText('organ mesh count')).toHaveTextContent('1')
  })
})
