import * as THREE from 'three'

export const PARTICLE_COUNT = 60

const PARTICLE_SPREAD = 0.5
const VELOCITY_SPREAD = 2
const UPWARD_VELOCITY_BIAS = 0.5

export function initializeParticleBurst(
  center: THREE.Vector3,
  positions: Float32Array,
  velocities: Float32Array,
  random: () => number = Math.random,
): void {
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const positionIndex = i * 3

    positions[positionIndex] = center.x + (random() - 0.5) * PARTICLE_SPREAD
    positions[positionIndex + 1] = center.y + (random() - 0.5) * PARTICLE_SPREAD
    positions[positionIndex + 2] = center.z + (random() - 0.5) * PARTICLE_SPREAD
    velocities[positionIndex] = (random() - 0.5) * VELOCITY_SPREAD
    velocities[positionIndex + 1] = (random() - 0.5) * VELOCITY_SPREAD + UPWARD_VELOCITY_BIAS
    velocities[positionIndex + 2] = (random() - 0.5) * VELOCITY_SPREAD
  }
}
