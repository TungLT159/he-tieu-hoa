import * as THREE from 'three'

export const DIGESTIVE_COLOR_TEXTURE_URL = '/textures/digestive system.png'
export const DIGESTIVE_NORMAL_TEXTURE_URL = '/textures/digestive system normalmap.png'

let cachedColorTexture: THREE.Texture | null = null
let cachedNormalTexture: THREE.Texture | null = null

export function resetDigestiveTextureCacheForTests(): void {
  cachedColorTexture = null
  cachedNormalTexture = null
}

function loadDigestiveTextures(): { colorTexture: THREE.Texture; normalTexture: THREE.Texture } {
  if (!cachedColorTexture || !cachedNormalTexture) {
    const textureLoader = new THREE.TextureLoader()

    cachedColorTexture = textureLoader.load(DIGESTIVE_COLOR_TEXTURE_URL)
    cachedNormalTexture = textureLoader.load(DIGESTIVE_NORMAL_TEXTURE_URL)

    cachedColorTexture.colorSpace = THREE.SRGBColorSpace
    cachedColorTexture.wrapS = THREE.RepeatWrapping
    cachedColorTexture.wrapT = THREE.RepeatWrapping
    cachedNormalTexture.wrapS = THREE.RepeatWrapping
    cachedNormalTexture.wrapT = THREE.RepeatWrapping
  }

  return { colorTexture: cachedColorTexture, normalTexture: cachedNormalTexture }
}

export function createDigestiveMeshMaterial(): THREE.MeshPhysicalMaterial {
  const { colorTexture, normalTexture } = loadDigestiveTextures()

  return new THREE.MeshPhysicalMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughness: 0.6,
    metalness: 0.05,
    clearcoat: 0,
    clearcoatRoughness: 0.4,
  })
}

export function disposeDigestiveMeshMaterial(material: THREE.Mesh['material']): void {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose())
    return
  }

  material.dispose()
}
