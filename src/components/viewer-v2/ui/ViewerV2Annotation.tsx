import { useEffect, useState } from 'react'
import type { PointerEvent } from 'react'

import { cn } from '@/lib/utils'

import { useViewerV2 } from '../viewerV2Context'

const ERASER_RADIUS = 14

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

export function ViewerV2Annotation() {
  const { annotationTool, drawColor, isDrawing } = useViewerV2()
  const [lines, setLines] = useState<DrawLine[]>([])
  const [activeLineId, setActiveLineId] = useState<number | null>(null)

  useEffect(() => {
    const canvas = document.querySelector('[data-viewer-canvas]')
    const clearLines = () => setLines([])

    canvas?.addEventListener('annotation-clear', clearLines)
    return () => canvas?.removeEventListener('annotation-clear', clearLines)
  }, [])

  if (!isDrawing) return null

  const eraseAtPoint = (point: Point) => {
    setLines((currentLines) => currentLines.filter((line) => !isPointNearLine(point, line)))
  }

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = getPointerPoint(event)

    if (annotationTool === 'eraser') {
      eraseAtPoint(point)
      return
    }

    const id = Date.now()
    setActiveLineId(id)
    setLines((currentLines) => [...currentLines, { id, color: drawColor, points: [point] }])
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = getPointerPoint(event)

    if (annotationTool === 'eraser') {
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
    <svg
      data-testid="viewer-v2-annotation-surface"
      className={cn(
        'pointer-events-auto absolute inset-0 z-20 h-full w-full touch-none',
        annotationTool === 'eraser' ? 'cursor-crosshair' : 'cursor-pencil',
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setActiveLineId(null)}
    >
      {lines.map((line) => (
        <path
          key={line.id}
          data-testid="viewer-v2-annotation-line"
          d={createPath(line.points)}
          fill="none"
          stroke={line.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          pointerEvents={annotationTool === 'eraser' ? 'stroke' : 'none'}
          onPointerDown={(event) => {
            if (annotationTool !== 'eraser') return
            event.stopPropagation()
            setLines((currentLines) => currentLines.filter((currentLine) => currentLine.id !== line.id))
          }}
        />
      ))}
    </svg>
  )
}
