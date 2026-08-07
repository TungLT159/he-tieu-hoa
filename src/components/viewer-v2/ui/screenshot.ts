import { invoke } from '@tauri-apps/api/core'

export async function captureScreenshot(): Promise<void> {
  try {
    await invoke('open_system_screenshot_tool')
    return
  } catch {
    fallbackCanvasCapture()
  }
}

export function fallbackCanvasCapture(): void {
  const element = document.querySelector('[data-viewer-canvas]')

  if (!(element instanceof HTMLCanvasElement)) {
    console.warn('Viewer canvas not found for screenshot')
    return
  }

  if (element.width <= 0 || element.height <= 0) {
    console.warn('Viewer canvas is empty for screenshot')
    return
  }

  try {
    const dataUrl = element.toDataURL('image/png')
    const anchor = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(':', '-')
    anchor.href = dataUrl
    anchor.download = `hetieuhoa-screenshot-${timestamp}.png`
    anchor.click()
  } catch (error) {
    console.warn('Viewer screenshot capture failed', error)
  }
}
