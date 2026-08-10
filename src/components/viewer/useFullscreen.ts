import { useCallback, useEffect, useRef, useState } from 'react'

interface FullscreenWindow {
  isFullscreen: () => Promise<boolean>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  onResized?: (handler: () => void | Promise<void>) => Promise<() => void>
}

async function getTauriWindow(): Promise<FullscreenWindow | null> {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    return getCurrentWindow()
  } catch {
    return null
  }
}

function readBrowserFullscreen() {
  return Boolean(document.fullscreenElement)
}

async function toggleBrowserFullscreen(setIsFullscreen: (fullscreen: boolean) => void) {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    setIsFullscreen(false)
    return
  }

  await document.documentElement.requestFullscreen()
  setIsFullscreen(true)
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const tauriWindowRef = useRef<FullscreenWindow | null>(null)

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    async function refreshTauriState(win: FullscreenWindow): Promise<boolean> {
      try {
        const current = await win.isFullscreen()
        if (!cancelled) setIsFullscreen(current)
        return !cancelled
      } catch (error) {
        console.error('Unable to read fullscreen state.', error)
        return false
      }
    }

    function initBrowserState() {
      const handleFullscreenChange = () => setIsFullscreen(readBrowserFullscreen())
      setIsFullscreen(readBrowserFullscreen())
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      cleanup = () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }

    async function init() {
      const win = await getTauriWindow()
      if (cancelled) return

      if (win) {
        tauriWindowRef.current = win
        const initializedTauriState = await refreshTauriState(win)
        if (!initializedTauriState) {
          tauriWindowRef.current = null
          if (!cancelled) initBrowserState()
          return
        }
        try {
          if (cancelled) return

          const unlisten = await win.onResized?.(async () => {
            await refreshTauriState(win)
          })

          if (cancelled) {
            unlisten?.()
            return
          }

          cleanup = unlisten
        } catch (error) {
          console.error('Unable to subscribe to fullscreen state changes.', error)
        }
        return
      }

      initBrowserState()
    }

    void init().catch((error) => console.error('Unable to initialize fullscreen state.', error))

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const win = tauriWindowRef.current ?? (await getTauriWindow())

    if (win) {
      tauriWindowRef.current = win
      try {
        const current = await win.isFullscreen()
        await win.setFullscreen(!current)
        setIsFullscreen(!current)
        return
      } catch (error) {
        console.error('Unable to toggle fullscreen.', error)
      }
    }

    try {
      await toggleBrowserFullscreen(setIsFullscreen)
    } catch (error) {
      console.error('Unable to toggle fullscreen.', error)
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
