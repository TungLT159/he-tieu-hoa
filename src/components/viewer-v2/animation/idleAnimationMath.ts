export function calculateIdleTransform(time: number): { scale: number; y: number } {
  return {
    scale: 1 + Math.sin(time * 0.8) * 0.005,
    y: Math.sin(time * 0.5) * 0.05,
  }
}
