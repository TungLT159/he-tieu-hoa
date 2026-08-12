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
  Info,
  PencilSimple,
  Play,
  Question,
  Sparkle,
  VideoCamera,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useFullscreen } from '../../viewer/useFullscreen'
import { useViewerV2 } from '../viewerV2Context'
import { AnnotationToolbar } from './AnnotationToolbar'
import { ChatbotPanel } from './ai/ChatbotPanel'
import { ColorPickerPopover } from './ColorPickerPopover'
import { GenAIPanel } from './ai/GenAIPanel'
import { InfoPanel } from './InfoPanel'
import { OrganInfoCard } from './OrganInfoCard'
import { PlaceholderDialog } from './PlaceholderDialog'
import { ViewerV2Annotation } from './ViewerV2Annotation'
import { captureScreenshot } from './screenshot'
import { VideoPlayerPanel } from './VideoPlayerPanel'
import { ViewerV2SettingsPanel } from './ViewerV2SettingsPanel'

interface MenuButtonDef {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
}

function ViewerV2MenuGroup({
  buttons,
  collapsed,
  title,
}: {
  title: string
  buttons: MenuButtonDef[]
  collapsed?: boolean
}) {
  return (
    <div className="space-y-1 px-2">
      <p className={cn('px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground', collapsed && 'sr-only')}>
        {title}
      </p>
      <div className="space-y-0.5">
        {buttons.map((button) => {
          const Icon = button.icon
          const disabled = button.disabled === true

          return (
            <Button
              key={button.id}
              type="button"
              variant={button.active ? 'secondary' : 'ghost'}
              size={collapsed ? 'icon' : 'default'}
              className={cn(
                'w-full justify-start gap-2',
                collapsed && 'h-9 w-9 justify-center',
                disabled && 'pointer-events-auto opacity-50',
              )}
              onClick={disabled ? undefined : button.onClick}
              aria-disabled={disabled || undefined}
              aria-pressed={button.active}
              title={button.title ?? button.label}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className={cn('truncate', collapsed && 'sr-only')}>{button.label}</span>
            </Button>
          )
        })}
      </div>
      <div className="my-1 h-px bg-border" />
    </div>
  )
}

export function ViewerV2Overlay() {
  const navigate = useNavigate()
  const {
    activeSheet,
    backgroundColor,
    isDrawing,
    flyCameraActive,
    isMenuOpen,
    isSpinning,
    modelColor,
    requestViewReset,
    setActiveSheet,
    setBackgroundColor,
    setIsDrawing,
    setIsMenuOpen,
    setIsSpinning,
    setActiveDialog,
    setFlyCameraActive,
    setModelColor,
    activeDialog,
    selectedOrgan,
  } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasOpenPanel = activeSheet !== null || activeDialog !== null

  const toggleSheet = (sheet: 'chatbot' | 'settings' | 'video') => {
    if (activeSheet === sheet) {
      setActiveSheet(null)
      return
    }

    setActiveDialog(null)
    setActiveSheet(sheet)
  }

  const openDialog = (dialog: 'info' | 'quiz' | 'genai') => {
    setActiveSheet(null)
    setActiveDialog(dialog)
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
    { id: 'quiz', label: t('viewer.menu.quiz'), icon: Question, onClick: () => openDialog('quiz') },
    { id: 'info', label: t('viewer.menu.info'), icon: Info, onClick: () => openDialog('info') },
    {
      id: 'video',
      label: t('viewer.menu.video'),
      icon: Play,
      onClick: () => toggleSheet('video'),
      active: activeSheet === 'video',
    },
    { id: 'genai', label: t('viewer.menu.genai'), icon: Sparkle, onClick: () => openDialog('genai') },
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
    { id: 'screenshot', label: t('viewer.menu.screenshot'), icon: Camera, onClick: captureScreenshot },
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
      onClick: () => navigate('/'),
    },
  ]

  return (
    <>
      <div
        className={cn(
          'absolute left-0 top-0 z-10 flex h-full flex-col border-r bg-background/95 shadow-lg backdrop-blur transition-all duration-200',
          isMenuOpen ? 'w-[280px]' : 'w-[52px]',
        )}
      >
        <div className={cn('flex items-center border-b p-2', !isMenuOpen && 'justify-center')}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isMenuOpen ? t('viewer.menu.collapse') : t('viewer.menu.expand')}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <CaretLeft aria-hidden /> : <CaretRight aria-hidden />}
          </Button>
          {isMenuOpen ? <span className="ml-2 truncate text-sm font-medium">{t('app.name')}</span> : null}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ViewerV2MenuGroup title={t('viewer.menu.group.modelInteraction')} buttons={modelInteractionButtons} collapsed={!isMenuOpen} />
          <div className="space-y-0.5 px-2">
              <ColorPickerPopover
                label={t('viewer.menu.modelColor')}
                value={modelColor}
                onChange={setModelColor}
                onReset={() => setModelColor(null)}
                collapsed={!isMenuOpen}
              />
              <ColorPickerPopover
                label={t('viewer.menu.backgroundColor')}
                value={backgroundColor}
                onChange={setBackgroundColor}
                collapsed={!isMenuOpen}
              />
          </div>
          <ViewerV2MenuGroup title={t('viewer.menu.group.learning')} buttons={learningButtons} collapsed={!isMenuOpen} />
          <ViewerV2MenuGroup title={t('viewer.menu.group.tools')} buttons={toolsButtons} collapsed={!isMenuOpen} />
          <ViewerV2MenuGroup title={t('viewer.menu.group.system')} buttons={systemButtons} collapsed={!isMenuOpen} />
        </div>
      </div>
      {selectedOrgan && !hasOpenPanel ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-4 top-4 z-20 shadow-lg"
          aria-label={t('viewer.returnToOverview')}
          onClick={requestViewReset}
        >
          <House aria-hidden />
        </Button>
      ) : null}
      {activeSheet === 'settings' ? <ViewerV2SettingsPanel /> : null}
      {activeSheet === 'chatbot' ? <ChatbotPanel onClose={() => setActiveSheet(null)} /> : null}
      {activeDialog === 'info' ? <InfoPanel onClose={() => setActiveDialog(null)} /> : null}
      {activeDialog === 'quiz' ? (
        <PlaceholderDialog
          titleKey="viewer.quiz.title"
          placeholderKey="viewer.quiz.placeholder"
          onClose={() => setActiveDialog(null)}
        />
      ) : null}
      {activeDialog === 'genai' ? <GenAIPanel onClose={() => setActiveDialog(null)} /> : null}
      {activeSheet === 'video' ? <VideoPlayerPanel onClose={() => setActiveSheet(null)} /> : null}
      <OrganInfoCard />
      <ViewerV2Annotation />
      <AnnotationToolbar />
    </>
  )
}
