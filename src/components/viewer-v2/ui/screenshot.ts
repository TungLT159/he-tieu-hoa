export function captureScreenshot(): void {
  if (isWindows()) {
    if (openNativeScreenshotTool('ms-screenclip:')) {
      return
    }
  }

  if (isMacOS()) {
    if (openNativeScreenshotTool('screencapture:')) {
      return
    }
  }

  fallbackCanvasCapture()
}

function openNativeScreenshotTool(uri: string): boolean {
  try {
    const openedWindow = window.open(uri, '_blank', 'noopener,noreferrer')
    return openedWindow !== null
  } catch {
    return false
  }
}

function isWindows(): boolean {
  return /win/i.test(window.navigator.platform || window.navigator.userAgent)
}

function isMacOS(): boolean {
  return /mac/i.test(window.navigator.platform || window.navigator.userAgent)
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
