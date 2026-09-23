import { useCallback, useEffect, useRef } from 'react'
import type { Point, Rect, Shape, Viewport } from '../types/shape'
import { rectFromPoints, screenToCanvas } from '../utils/geometry'

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

const ANCHOR_CORNER: Record<ResizeHandle, (shape: Shape) => Point> = {
  nw: (shape) => ({ x: shape.x + shape.width, y: shape.y + shape.height }),
  ne: (shape) => ({ x: shape.x, y: shape.y + shape.height }),
  sw: (shape) => ({ x: shape.x + shape.width, y: shape.y }),
  se: (shape) => ({ x: shape.x, y: shape.y }),
}

interface UseResizingArgs {
  viewport: Viewport
  containerRef: React.RefObject<HTMLDivElement | null>
  shape: Shape | null
  onResize: (rect: Rect) => void
}

export function useResizing({ viewport, containerRef, shape, onResize }: UseResizingArgs) {
  const anchorRef = useRef<Point | null>(null)
  const viewportRef = useRef(viewport)
  const shapeRef = useRef(shape)
  const onResizeRef = useRef(onResize)
  viewportRef.current = viewport
  shapeRef.current = shape
  onResizeRef.current = onResize

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

  const beginResize = useCallback((handle: ResizeHandle) => {
    const current = shapeRef.current
    if (!current) return
    anchorRef.current = ANCHOR_CORNER[handle](current)
  }, [])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const anchor = anchorRef.current
      const current = toCanvasPoint(event.clientX, event.clientY)
      if (!anchor || !current) return
      onResizeRef.current(rectFromPoints(anchor, current))
    }

    const onPointerUp = () => {
      anchorRef.current = null
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [toCanvasPoint])

  return { beginResize }
}
