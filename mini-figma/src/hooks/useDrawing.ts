import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_FILLS, MIN_DRAG_SIZE_PX } from '../constants/shapes'
import type { Point, Shape, ShapeType, Viewport } from '../types/shape'
import { rectFromPoints, screenToCanvas } from '../utils/geometry'

const DRAFT_ID = 'draft'

interface UseDrawingArgs {
  viewport: Viewport
  containerRef: React.RefObject<HTMLDivElement | null>
  onFinish: (shape: Shape) => void
}

export function useDrawing({ viewport, containerRef, onFinish }: UseDrawingArgs) {
  const [draft, setDraft] = useState<Shape | null>(null)
  const draftRef = useRef<Shape | null>(null)
  const startRef = useRef<Point | null>(null)
  const viewportRef = useRef(viewport)
  const onFinishRef = useRef(onFinish)
  viewportRef.current = viewport
  onFinishRef.current = onFinish

  const toCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const el = containerRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return screenToCanvas(
        { x: clientX - rect.left, y: clientY - rect.top },
        viewportRef.current,
      )
    },
    [containerRef],
  )

  const beginDraw = useCallback(
    (type: ShapeType, clientX: number, clientY: number) => {
      const start = toCanvasPoint(clientX, clientY)
      if (!start) return
      startRef.current = start
      const next: Shape = {
        id: DRAFT_ID,
        type,
        ...rectFromPoints(start, start),
        fill: DEFAULT_FILLS[type],
      }
      draftRef.current = next
      setDraft(next)
    },
    [toCanvasPoint],
  )

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const start = startRef.current
      const draftShape = draftRef.current
      const current = toCanvasPoint(event.clientX, event.clientY)
      if (!start || !draftShape || !current) return
      const next: Shape = { ...draftShape, ...rectFromPoints(start, current) }
      draftRef.current = next
      setDraft(next)
    }

    const onPointerUp = (event: PointerEvent) => {
      const start = startRef.current
      const draftShape = draftRef.current
      const current = toCanvasPoint(event.clientX, event.clientY)
      startRef.current = null
      draftRef.current = null
      setDraft(null)
      if (!start || !draftShape || !current) return
      const rect = rectFromPoints(start, current)
      const zoom = viewportRef.current.zoom
      if (rect.width * zoom < MIN_DRAG_SIZE_PX && rect.height * zoom < MIN_DRAG_SIZE_PX) {
        return
      }
      onFinishRef.current({ ...draftShape, ...rect, id: crypto.randomUUID() })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [toCanvasPoint])

  return { draft, beginDraw }
}
