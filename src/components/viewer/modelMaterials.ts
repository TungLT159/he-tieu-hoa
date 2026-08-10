import * as THREE from 'three'

export const DIGESTIVE_COLOR_TEXTURE_URL = '/textures/digestive system.png'
export const DIGESTIVE_NORMAL_TEXTURE_URL = '/textures/digestive system normalmap.png'

let cachedColorTexture: THREE.Texture | null = null
let cachedNormalTexture: THREE.Texture | null = null

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

export function createDigestiveMeshMaterial(): THREE.MeshStandardMaterial {
  const { colorTexture, normalTexture } = loadDigestiveTextures()

  return new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughness: 0.72,
    metalness: 0,
  })
}

export function disposeDigestiveMeshMaterial(material: THREE.Mesh['material']): void {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose())
    return
  }

  material.dispose()
}
