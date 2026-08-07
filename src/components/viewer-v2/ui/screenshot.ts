export function captureScreenshot(): void {
  if (isWindows()) {
    try {
      const openedWindow = window.open(
        'ms-screenclip:',
        '_blank',
        'noopener,noreferrer',
      )

      if (openedWindow !== null) {
        return
      }
    } catch {
      // Fall back below when the WebView blocks custom protocol navigation.
    }
  }

  // Browsers and Tauri do not expose a reliable macOS screenshot URI.
  fallbackCanvasCapture()
}

function isWindows(): boolean {
  return /win/i.test(window.navigator.platform || window.navigator.userAgent)
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
