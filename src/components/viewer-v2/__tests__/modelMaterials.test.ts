import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DIGESTIVE_COLOR_TEXTURE_URL,
  DIGESTIVE_NORMAL_TEXTURE_URL,
  createDigestiveMeshMaterial,
  disposeDigestiveMeshMaterial,
  resetDigestiveTextureCacheForTests,
} from '../modelMaterials'

const { loadTexture, loadedTextures } = vi.hoisted(() => {
  const loadedTextures = new Map<string, THREE.Texture>()

  return {
    loadTexture: vi.fn((url: string) => {
      const texture = new THREE.Texture()
      loadedTextures.set(url, texture)
      return texture
    }),
    loadedTextures,
  }
})

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')

  class MockTextureLoader {
    load(url: string) {
      return loadTexture(url)
    }
  }

  return {
    ...actual,
    TextureLoader: MockTextureLoader,
  }
})

describe('modelMaterials', () => {
  beforeEach(() => {
    resetDigestiveTextureCacheForTests()
    loadTexture.mockClear()
    loadedTextures.clear()
  })

  it('creates a MeshPhysicalMaterial with expected texture URLs and PBR defaults', () => {
    const material = createDigestiveMeshMaterial()

    expect(material).toBeInstanceOf(THREE.MeshPhysicalMaterial)
    expect(material.map).toBe(loadedTextures.get(DIGESTIVE_COLOR_TEXTURE_URL))
    expect(material.normalMap).toBe(loadedTextures.get(DIGESTIVE_NORMAL_TEXTURE_URL))
    expect(loadTexture).toHaveBeenCalledWith('/textures/digestive system.png')
    expect(loadTexture).toHaveBeenCalledWith('/textures/digestive system normalmap.png')
    expect(material.roughness).toBe(0.6)
    expect(material.metalness).toBe(0.05)
    expect(material.clearcoat).toBe(0)
    expect(material.clearcoatRoughness).toBe(0.4)
  })

  it('disposes a single material', () => {
    const material = createDigestiveMeshMaterial()
    const dispose = vi.spyOn(material, 'dispose')

    disposeDigestiveMeshMaterial(material)

    expect(dispose).toHaveBeenCalledOnce()
  })

  it('disposes each material in an array', () => {
    const material = createDigestiveMeshMaterial()
    const secondMaterial = createDigestiveMeshMaterial()
    const dispose = vi.spyOn(material, 'dispose')
    const secondDispose = vi.spyOn(secondMaterial, 'dispose')

    disposeDigestiveMeshMaterial([material, secondMaterial])

    expect(dispose).toHaveBeenCalledOnce()
    expect(secondDispose).toHaveBeenCalledOnce()
  })
})
