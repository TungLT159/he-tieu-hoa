import { useState } from 'react'
import type { PointerEvent } from 'react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useViewer } from './viewerContext'

const DRAW_COLORS = ['#ff0000', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ffffff']
const ERASER_RADIUS = 14

type AnnotationTool = 'pen' | 'eraser'

interface Point {
  x: number
  y: number
}

interface DrawLine {
  id: number
  color: string
  points: Point[]
}

function distanceToSegment(point: Point, start: Point, end: Point) {
  const segmentX = end.x - start.x
  const segmentY = end.y - start.y
  const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY

  if (segmentLengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y)

  const position = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / segmentLengthSquared),
  )

  return Math.hypot(point.x - (start.x + position * segmentX), point.y - (start.y + position * segmentY))
}

function isPointNearLine(point: Point, line: DrawLine) {
  const firstPoint = line.points[0]
  if (!firstPoint) return false
  if (line.points.length === 1) return Math.hypot(point.x - firstPoint.x, point.y - firstPoint.y) <= ERASER_RADIUS

  return line.points.some((linePoint, index) => {
    if (index === 0) return false

    const previousPoint = line.points[index - 1]
    return previousPoint ? distanceToSegment(point, previousPoint, linePoint) <= ERASER_RADIUS : false
  })
}

function createPath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function getPointerPoint(event: PointerEvent<SVGElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(event.clientY - rect.top),
  }
}

export function ViewerAnnotation() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { drawColor, isDrawing, setDrawColor, setIsDrawing } = useViewer()
  const [tool, setTool] = useState<AnnotationTool>('pen')
  const [lines, setLines] = useState<DrawLine[]>([])
  const [activeLineId, setActiveLineId] = useState<number | null>(null)

  if (!isDrawing) return null

  const eraseAtPoint = (point: Point) => {
    setLines((currentLines) => currentLines.filter((line) => !isPointNearLine(point, line)))
  }

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = getPointerPoint(event)

    if (tool === 'eraser') {
      eraseAtPoint(point)
      return
    }

    const id = Date.now()
    setActiveLineId(id)
    setLines((currentLines) => [...currentLines, { id, color: drawColor, points: [point] }])
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = getPointerPoint(event)

    if (tool === 'eraser') {
      if (event.buttons === 1) eraseAtPoint(point)
      return
    }

    if (activeLineId === null) return

    setLines((currentLines) =>
      currentLines.map((line) => (line.id === activeLineId ? { ...line, points: [...line.points, point] } : line)),
    )
  }

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setActiveLineId(null)
  }

  return (
    <div className="absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-1/2 top-4 z-10 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/90 p-2 shadow-lg backdrop-blur">
        <Button
          type="button"
          size="sm"
          variant={tool === 'pen' ? 'default' : 'secondary'}
          aria-pressed={tool === 'pen'}
          aria-label={t('viewer.annotation.pen')}
          title={t('viewer.annotation.pen')}
          onClick={() => setTool('pen')}
        >
          {t('viewer.annotation.pen')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tool === 'eraser' ? 'default' : 'secondary'}
          aria-pressed={tool === 'eraser'}
          aria-label={t('viewer.annotation.eraser')}
          title={t('viewer.annotation.eraser')}
          onClick={() => setTool('eraser')}
        >
          {t('viewer.annotation.eraser')}
        </Button>
        <div className="flex items-center gap-1">
          {DRAW_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={t('viewer.annotation.color', { color })}
              aria-pressed={drawColor === color}
              title={t('viewer.annotation.color', { color })}
              className="size-7 rounded-full border border-border ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ring"
              style={{ backgroundColor: color }}
              onClick={() => {
                setTool('pen')
                setDrawColor(color)
              }}
            />
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={t('viewer.annotation.clearAll')}
          title={t('viewer.annotation.clearAll')}
          onClick={() => setLines([])}
        >
          {t('viewer.annotation.clearAll')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={t('viewer.annotation.exit')}
          title={t('viewer.annotation.exit')}
          onClick={() => setIsDrawing(false)}
        >
          {t('viewer.annotation.exit')}
        </Button>
      </div>
      <svg
        data-testid="annotation-drawing-surface"
        className={cn('h-full w-full touch-none', tool === 'eraser' ? 'cursor-crosshair' : 'cursor-pencil')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setActiveLineId(null)}
      >
        {lines.map((line) => (
          <path
            key={line.id}
            data-testid="annotation-line"
            d={createPath(line.points)}
            fill="none"
            stroke={line.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            pointerEvents={tool === 'eraser' ? 'stroke' : 'none'}
            onPointerDown={(event) => {
              if (tool !== 'eraser') return
              event.stopPropagation()
              setLines((currentLines) => currentLines.filter((currentLine) => currentLine.id !== line.id))
            }}
          />
        ))}
      </svg>
    </div>
  )
}
