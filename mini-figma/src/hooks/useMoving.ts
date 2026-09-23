import { useCallback, useEffect, useRef } from 'react'
import type { Point, Viewport } from '../types/shape'
import { screenToCanvas } from '../utils/geometry'

interface UseMovingArgs {
  viewport: Viewport
  containerRef: React.RefObject<HTMLDivElement | null>
  onMove: (dx: number, dy: number) => void
}

export function useMoving({ viewport, containerRef, onMove }: UseMovingArgs) {
  const lastRef = useRef<Point | null>(null)
  const viewportRef = useRef(viewport)
  const onMoveRef = useRef(onMove)
  viewportRef.current = viewport
  onMoveRef.current = onMove

  const beginMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      lastRef.current = screenToCanvas(
        { x: clientX - rect.left, y: clientY - rect.top },
        viewportRef.current,
      )
    },
    [containerRef],
  )

  useEffect(() => {
    const toCanvasPoint = (event: PointerEvent): Point | null => {
      const el = containerRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return screenToCanvas(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        viewportRef.current,
      )
    }

    const onPointerMove = (event: PointerEvent) => {
      const last = lastRef.current
      const current = toCanvasPoint(event)
      if (!last || !current) return
      const dx = current.x - last.x
      const dy = current.y - last.y
      if (dx === 0 && dy === 0) return
      lastRef.current = current
      onMoveRef.current(dx, dy)
    }

    const onPointerUp = () => {
      lastRef.current = null
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [containerRef])

  return { beginMove }
}
