import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DIGESTIVE_COLOR_TEXTURE_URL,
  DIGESTIVE_NORMAL_TEXTURE_URL,
  createDigestiveMeshMaterial,
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
    loadTexture.mockClear()
    loadedTextures.clear()
  })

  it('exports the digestive texture URLs', () => {
    expect(DIGESTIVE_COLOR_TEXTURE_URL).toBe('/textures/digestive system.png')
    expect(DIGESTIVE_NORMAL_TEXTURE_URL).toBe('/textures/digestive system normalmap.png')
  })

  it('creates per-mesh materials that reuse cached color and normal textures', () => {
    const material = createDigestiveMeshMaterial()
    const secondMaterial = createDigestiveMeshMaterial()

    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(secondMaterial).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(material).not.toBe(secondMaterial)
    expect(material.map).toBe(loadedTextures.get(DIGESTIVE_COLOR_TEXTURE_URL))
    expect(material.normalMap).toBe(loadedTextures.get(DIGESTIVE_NORMAL_TEXTURE_URL))
    expect(secondMaterial.map).toBe(material.map)
    expect(secondMaterial.normalMap).toBe(material.normalMap)
    expect(loadTexture).toHaveBeenCalledTimes(2)
    expect(loadTexture).toHaveBeenCalledWith(DIGESTIVE_COLOR_TEXTURE_URL)
    expect(loadTexture).toHaveBeenCalledWith(DIGESTIVE_NORMAL_TEXTURE_URL)
    expect(material.roughness).toBe(0.72)
    expect(material.metalness).toBe(0)
    expect(material.map?.colorSpace).toBe(THREE.SRGBColorSpace)
    expect(material.map?.wrapS).toBe(THREE.RepeatWrapping)
    expect(material.map?.wrapT).toBe(THREE.RepeatWrapping)
    expect(material.normalMap?.wrapS).toBe(THREE.RepeatWrapping)
    expect(material.normalMap?.wrapT).toBe(THREE.RepeatWrapping)
  })
})
