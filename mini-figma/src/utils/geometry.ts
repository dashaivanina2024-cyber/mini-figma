import type { Point, Rect, Viewport } from '../types/shape'

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4

export function screenToCanvas(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.x) / viewport.zoom,
    y: (screen.y - viewport.y) / viewport.zoom,
  }
}

export function canvasToScreen(canvas: Point, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.x,
    y: canvas.y * viewport.zoom + viewport.y,
  }
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

export function zoomViewportAtPoint(
  viewport: Viewport,
  nextZoom: number,
  screenPoint: Point,
): Viewport {
  const zoom = clampZoom(nextZoom)
  const anchor = screenToCanvas(screenPoint, viewport)
  return {
    zoom,
    x: screenPoint.x - anchor.x * zoom,
    y: screenPoint.y - anchor.y * zoom,
  }
}

export function panViewport(viewport: Viewport, dx: number, dy: number): Viewport {
  return { ...viewport, x: viewport.x + dx, y: viewport.y + dy }
}

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  }
}
