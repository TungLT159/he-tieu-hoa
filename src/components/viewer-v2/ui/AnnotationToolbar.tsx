import { Eraser, PaintBrush, SignOut, Trash } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useViewerV2 } from '../viewerV2Context'

export function AnnotationToolbar() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { annotationTool, drawColor, isDrawing, setAnnotationTool, setDrawColor, setIsDrawing } = useViewerV2()

  if (!isDrawing) return null

  const colorLabel = t('viewer.annotation.color', { color: drawColor })
  const dispatchClear = () => {
    document.querySelector('[data-viewer-canvas]')?.dispatchEvent(new CustomEvent('annotation-clear'))
  }

  return (
    <div
      role="toolbar"
      aria-label={t('viewer.menu.annotation')}
      data-tutorial-target="annotation-toolbar"
      className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/90 p-2 shadow-lg backdrop-blur"
    >
      <Button
        type="button"
        size="sm"
        variant={annotationTool === 'pen' ? 'default' : 'secondary'}
        aria-pressed={annotationTool === 'pen'}
        aria-label={t('viewer.annotation.pen')}
        title={t('viewer.annotation.pen')}
        onClick={() => setAnnotationTool('pen')}
      >
        <PaintBrush className="h-4 w-4" aria-hidden />
        {t('viewer.annotation.pen')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={annotationTool === 'eraser' ? 'default' : 'secondary'}
        data-tutorial-target="annotation-eraser"
        aria-pressed={annotationTool === 'eraser'}
        aria-label={t('viewer.annotation.eraser')}
        title={t('viewer.annotation.eraser')}
        onClick={() => setAnnotationTool('eraser')}
      >
        <Eraser className="h-4 w-4" aria-hidden />
        {t('viewer.annotation.eraser')}
      </Button>
      <input
        type="color"
        value={drawColor}
        data-tutorial-target="annotation-color"
        aria-label={colorLabel}
        title={colorLabel}
        className="h-8 w-12 cursor-pointer rounded-md border border-input bg-background p-1 shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        onInput={(event) => setDrawColor(event.currentTarget.value)}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        data-tutorial-target="annotation-clear"
        aria-label={t('viewer.annotation.clearAll')}
        title={t('viewer.annotation.clearAll')}
        onClick={dispatchClear}
      >
        <Trash className="h-4 w-4" aria-hidden />
        {t('viewer.annotation.clearAll')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={t('viewer.annotation.exit')}
        title={t('viewer.annotation.exit')}
        className={cn('border-destructive/30 text-destructive hover:text-destructive')}
        onClick={() => setIsDrawing(false)}
      >
        <SignOut className="h-4 w-4" aria-hidden />
        {t('viewer.annotation.exit')}
      </Button>
    </div>
  )
}
