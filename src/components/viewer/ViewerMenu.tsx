import {
  ArrowsClockwise,
  ArrowsIn,
  ArrowsOut,
  Article,
  Camera,
  CaretLeft,
  CaretRight,
  ChatsCircle,
  GearSix,
  House,
  Image,
  Info,
  PaintBucket,
  PencilSimple,
  Play,
  Question,
  Sparkle,
  VideoCamera,
} from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { ColorPickerPopover } from './ColorPickerPopover'
import { useFullscreen } from './useFullscreen'
import { useViewer } from './viewerContext'
import { ViewerMenuGroup } from './ViewerMenuGroup'
import type { ActiveSheet } from './viewerContext'
import type { MenuButtonDef } from './ViewerMenuGroup'

export function ViewerMenu() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const {
    isMenuOpen,
    setIsMenuOpen,
    activeSheet,
    setActiveSheet,
    setActiveDialog,
    backgroundColor,
    setBackgroundColor,
    modelColor,
    setModelColor,
    isDrawing,
    setIsDrawing,
    isSpinning,
    setIsSpinning,
    flyCameraActive,
    setFlyCameraActive,
    requestViewReset,
  } = useViewer()
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const downloadScreenshot = () => {
    try {
      const canvas = document.querySelector('[data-viewer-canvas="true"]')
      if (!(canvas instanceof HTMLCanvasElement)) return
      if (canvas.width === 0 || canvas.height === 0) return

      canvas.toBlob((blob) => {
        if (!blob) return

        try {
          const imageUrl = URL.createObjectURL(blob)
          try {
            const link = document.createElement('a')
            link.href = imageUrl
            link.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
            link.click()
          } finally {
            URL.revokeObjectURL(imageUrl)
          }
        } catch {
          // Object URL creation or download triggering can fail in constrained runtimes.
        }
      }, 'image/png')
    } catch {
      // Canvas export can fail for unavailable or tainted WebGL contexts.
    }
  }

  const toggleSheet = (sheet: Exclude<ActiveSheet, null>) => {
    setActiveSheet(activeSheet === sheet ? null : sheet)
  }

  const modelInteractionButtons: MenuButtonDef[] = [
    {
      id: 'rotate',
      label: t('viewer.menu.rotateModel'),
      icon: ArrowsClockwise,
      onClick: () => setIsSpinning(!isSpinning),
      active: isSpinning,
      disabled: flyCameraActive,
    },
    {
      id: 'flyCamera',
      label: t('viewer.menu.flyCamera'),
      icon: VideoCamera,
      onClick: () => {
        if (flyCameraActive) {
          requestViewReset()
          setFlyCameraActive(false)
          return
        }

        setFlyCameraActive(true)
      },
      active: flyCameraActive,
      disabled: isSpinning,
    },
  ]

  const learningButtons: MenuButtonDef[] = [
    { id: 'quiz', label: t('viewer.menu.quiz'), icon: Question, onClick: () => setActiveDialog('quiz') },
    { id: 'info', label: t('viewer.menu.info'), icon: Info, onClick: () => setActiveDialog('info') },
    {
      id: 'video',
      label: t('viewer.menu.video'),
      icon: Play,
      onClick: () => {},
      disabled: true,
      title: t('viewer.menu.videoUnavailable'),
    },
    { id: 'genai', label: t('viewer.menu.genai'), icon: Sparkle, onClick: () => setActiveDialog('genai') },
  ]

  const toolsButtons: MenuButtonDef[] = [
    {
      id: 'chatbot',
      label: t('viewer.menu.chatbot'),
      icon: ChatsCircle,
      onClick: () => toggleSheet('chatbot'),
      active: activeSheet === 'chatbot',
    },
    {
      id: 'annotation',
      label: t('viewer.menu.annotation'),
      icon: PencilSimple,
      onClick: () => setIsDrawing(!isDrawing),
      active: isDrawing,
    },
    { id: 'screenshot', label: t('viewer.menu.screenshot'), icon: Camera, onClick: downloadScreenshot },
    {
      id: 'editor',
      label: t('viewer.menu.editor'),
      icon: Article,
      onClick: () => {},
      disabled: true,
      title: t('viewer.menu.editorUnavailable'),
    },
  ]

  const systemButtons: MenuButtonDef[] = [
    {
      id: 'settings',
      label: t('viewer.menu.settings'),
      icon: GearSix,
      onClick: () => toggleSheet('settings'),
      active: activeSheet === 'settings',
    },
    {
      id: 'fullscreen',
      label: isFullscreen ? t('viewer.menu.exitFullscreen') : t('viewer.menu.fullscreen'),
      icon: isFullscreen ? ArrowsIn : ArrowsOut,
      onClick: toggleFullscreen,
    },
    {
      id: 'home',
      label: t('viewer.menu.home'),
      icon: House,
      onClick: () => {},
      disabled: true,
      title: t('viewer.menu.homeUnavailable'),
    },
  ]

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-200',
        isMenuOpen ? 'w-[280px]' : 'w-[52px]',
      )}
    >
      <div className={cn('flex items-center border-b p-2', !isMenuOpen && 'justify-center')}>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={isMenuOpen ? t('viewer.menu.collapse') : t('viewer.menu.expand')}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {(() => {
            const ToggleIcon = isMenuOpen ? CaretLeft : CaretRight
            return <ToggleIcon aria-hidden="true" />
          })()}
        </button>
        {isMenuOpen ? <span className="ml-2 truncate text-sm font-medium">{t('app.name')}</span> : null}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <ViewerMenuGroup
          title={t('viewer.menu.group.modelInteraction')}
          buttons={modelInteractionButtons}
          collapsed={!isMenuOpen}
        />
        <div className="space-y-0.5 px-2">
          <ColorPickerPopover
            title={t('viewer.colorPicker.modelTitle')}
            label={t('viewer.menu.modelColor')}
            icon={PaintBucket}
            value={modelColor}
            onChange={setModelColor}
            onReset={() => setModelColor(null)}
            resetLabel={t('viewer.colorPicker.reset')}
            collapsed={!isMenuOpen}
          />
          <ColorPickerPopover
            title={t('viewer.colorPicker.backgroundTitle')}
            label={t('viewer.menu.backgroundColor')}
            icon={Image}
            value={backgroundColor}
            onChange={setBackgroundColor}
            collapsed={!isMenuOpen}
          />
        </div>
        <ViewerMenuGroup title={t('viewer.menu.group.learning')} buttons={learningButtons} collapsed={!isMenuOpen} />
        <ViewerMenuGroup title={t('viewer.menu.group.tools')} buttons={toolsButtons} collapsed={!isMenuOpen} />
        <ViewerMenuGroup title={t('viewer.menu.group.system')} buttons={systemButtons} collapsed={!isMenuOpen} />
      </div>
    </div>
  )
}
