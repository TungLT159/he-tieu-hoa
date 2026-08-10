import { describe, expect, it } from 'vitest'
import * as THREE from 'three'

import { normalizeModelForViewer } from '../modelTransform'

function modelBounds(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  return { center, size, maxDimension: Math.max(size.x, size.y, size.z) }
}

describe('normalizeModelForViewer', () => {
  it('centers and scales large coordinates into viewer range', () => {
    const model = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(22, 75, 20))
    mesh.position.set(-3, 131, 0)
    model.add(mesh)

    normalizeModelForViewer(model)

    const bounds = modelBounds(model)
    expect(bounds.center.x).toBeCloseTo(0)
    expect(bounds.center.y).toBeCloseTo(0)
    expect(bounds.center.z).toBeCloseTo(0)
    expect(bounds.maxDimension).toBeCloseTo(4)
  })

  it('centers and scales a model with a non-zero root position', () => {
    const model = new THREE.Group()
    model.position.set(12, -8, 5)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(22, 75, 20))
    mesh.position.set(-3, 131, 0)
    model.add(mesh)

    normalizeModelForViewer(model)

    const bounds = modelBounds(model)
    expect(bounds.center.x).toBeCloseTo(0)
    expect(bounds.center.y).toBeCloseTo(0)
    expect(bounds.center.z).toBeCloseTo(0)
    expect(bounds.maxDimension).toBeCloseTo(4)
  })

  it('does not shrink an already normalized model', () => {
    const model = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(22, 75, 20))
    mesh.position.set(-3, 131, 0)
    model.add(mesh)

    normalizeModelForViewer(model)
    const once = modelBounds(model)
    normalizeModelForViewer(model)
    const twice = modelBounds(model)

    expect(twice.center.toArray()).toEqual(once.center.toArray())
    expect(twice.maxDimension).toBeCloseTo(once.maxDimension)
  })
})
