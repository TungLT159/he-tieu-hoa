import { useViewer } from './viewerContext'

export function BackgroundClickPlane() {
  const { setSelectedOrgan } = useViewer()

  return (
    <mesh position={[0, 0, -10]} onPointerDown={() => setSelectedOrgan(null)}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
