import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'
import StarterApp from './app/App'
import { FrontendReadyMarker } from './components/FrontendReadyMarker'
import { LinuxTitlebar } from './components/LinuxTitlebar'
import { applyStoredThemeMode } from './lib/themeMode'
import { isMac, shouldUseCustomWindowChrome } from './utils/platform'

function dataTransferHasFiles(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false
  if (dataTransfer.files.length > 0) return true
  if (Array.from(dataTransfer.types).includes('Files')) return true

  return Array.from(dataTransfer.items).some((item) => item.kind === 'file')
}

function preventFileDropNavigation(event: DragEvent): void {
  if (!dataTransferHasFiles(event.dataTransfer)) return

  event.preventDefault()
}

function isTauriRuntime(targetWindow: Window): boolean {
  return '__TAURI__' in targetWindow || '__TAURI_INTERNALS__' in targetWindow
}

function preventNativeContextMenu(event: MouseEvent): void {
  event.preventDefault()
}

document.addEventListener('dragover', preventFileDropNavigation, true)
document.addEventListener('drop', preventFileDropNavigation, true)

if (isTauriRuntime(window)) {
  document.addEventListener('contextmenu', preventNativeContextMenu, true)
}

if (shouldUseCustomWindowChrome()) {
  document.body.classList.add('custom-window-chrome')
}

if (isMac()) {
  document.body.classList.add('mac-chrome')
}

applyStoredThemeMode(document, window.localStorage)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <LinuxTitlebar />
      <StarterApp />
      <FrontendReadyMarker />
    </TooltipProvider>
  </StrictMode>,
)
