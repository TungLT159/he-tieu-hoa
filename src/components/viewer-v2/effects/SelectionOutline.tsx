import { Selection } from '@react-three/postprocessing'
import type { ReactNode } from 'react'

interface SelectionOutlineProps {
  children: ReactNode
}

export function SelectionOutlineProvider({ children }: SelectionOutlineProps) {
  return <Selection>{children}</Selection>
}

export function SelectionOutlineTarget({ children }: SelectionOutlineProps) {
  // The model is loaded as a primitive scene, so wrapping this subtree in Select
  // selects every mesh at once. Organ-specific selection is handled by HighlightShader.
  return <>{children}</>
}

export function SelectionOutline({ children }: SelectionOutlineProps) {
  return (
    <SelectionOutlineProvider>
      <SelectionOutlineTarget>{children}</SelectionOutlineTarget>
    </SelectionOutlineProvider>
  )
}
