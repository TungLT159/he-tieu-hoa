import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ViewerProvider } from '../ViewerContext.tsx'
import { useViewer } from '../viewerContext'

function wrapper({ children }: { children: ReactNode }) {
  return <ViewerProvider>{children}</ViewerProvider>
}

describe('ViewerContext menu state', () => {
  it('defaults isMenuOpen to true and updates it', () => {
    const { result } = renderHook(() => useViewer(), { wrapper })

    expect(result.current.isMenuOpen).toBe(true)

    act(() => result.current.setIsMenuOpen(false))

    expect(result.current.isMenuOpen).toBe(false)
  })

  it('defaults activeSheet to null and updates it', () => {
    const { result } = renderHook(() => useViewer(), { wrapper })

    expect(result.current.activeSheet).toBeNull()

    act(() => result.current.setActiveSheet('settings'))
    expect(result.current.activeSheet).toBe('settings')

    act(() => result.current.setActiveSheet(null))
    expect(result.current.activeSheet).toBeNull()
  })

  it('defaults activeDialog to null and updates it', () => {
    const { result } = renderHook(() => useViewer(), { wrapper })

    expect(result.current.activeDialog).toBeNull()

    act(() => result.current.setActiveDialog('info'))
    expect(result.current.activeDialog).toBe('info')

    act(() => result.current.setActiveDialog(null))
    expect(result.current.activeDialog).toBeNull()
  })

  it('defaults viewer system, drawing, color, rotation, and camera menu state', () => {
    const { result } = renderHook(() => useViewer(), { wrapper })

    expect(result.current.isFullscreen).toBe(false)
    expect(result.current.isDrawing).toBe(false)
    expect(result.current.drawColor).toBe('#ff0000')
    expect(result.current.backgroundColor).toBe('#1a1a2e')
    expect(result.current.modelColor).toBeNull()
    expect(result.current.isSpinning).toBe(false)
    expect(result.current.flyCameraActive).toBe(false)
  })

  it('updates viewer system, drawing, color, rotation, and camera menu state', () => {
    const { result } = renderHook(() => useViewer(), { wrapper })

    act(() => result.current.setIsFullscreen(true))
    expect(result.current.isFullscreen).toBe(true)

    act(() => result.current.setIsDrawing(true))
    expect(result.current.isDrawing).toBe(true)

    act(() => result.current.setDrawColor('#00ff00'))
    expect(result.current.drawColor).toBe('#00ff00')

    act(() => result.current.setBackgroundColor('#000000'))
    expect(result.current.backgroundColor).toBe('#000000')

    act(() => result.current.setModelColor('#ffffff'))
    expect(result.current.modelColor).toBe('#ffffff')

    act(() => result.current.setModelColor(null))
    expect(result.current.modelColor).toBeNull()

    act(() => result.current.setIsSpinning(true))
    expect(result.current.isSpinning).toBe(true)

    act(() => result.current.setFlyCameraActive(true))
    expect(result.current.flyCameraActive).toBe(true)
  })
})
