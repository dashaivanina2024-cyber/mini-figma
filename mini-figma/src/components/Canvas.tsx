import type { ResizeHandle } from '../hooks/useResizing'
import type { Shape, ShapeType, ToolId, Viewport } from '../types/shape'
import { SelectionFrame } from './SelectionFrame'
import { ShapeView } from './Shape'

const GRID_SIZE_PX = 24
const GRID_LINE = 'rgba(255, 255, 255, 0.07)'

interface CanvasProps {
  viewport: Viewport
  containerRef: React.RefObject<HTMLDivElement | null>
  spaceHeld: boolean
  isPanning: boolean
  activeTool: ToolId
  shapes: Shape[]
  draft: Shape | null
  selectedIds: string[]
  onPanStart: (x: number, y: number) => void
  onBeginDraw: (type: ShapeType, clientX: number, clientY: number) => void
  onBeginMove: (clientX: number, clientY: number) => void
  onResizeStart: (handle: ResizeHandle) => void
  onSelectShape: (id: string | null) => void
}

export function Canvas({
  viewport,
  containerRef,
  spaceHeld,
  isPanning,
  activeTool,
  shapes,
  draft,
  selectedIds,
  onPanStart,
  onBeginDraw,
  onBeginMove,
  onResizeStart,
  onSelectShape,
}: CanvasProps) {
  const cursor = isPanning
    ? 'grabbing'
    : spaceHeld
      ? 'grab'
      : activeTool === 'select'
        ? 'default'
        : 'crosshair'

  const gridStyle: React.CSSProperties = {
    cursor,
    backgroundColor: '#1e1e1e',
    backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
    backgroundSize: `${GRID_SIZE_PX * viewport.zoom}px ${GRID_SIZE_PX * viewport.zoom}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
  }

  const selectedShape =
    selectedIds.length === 1
      ? (shapes.find((shape) => shape.id === selectedIds[0]) ?? null)
      : null

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (spaceHeld) {
      event.currentTarget.setPointerCapture(event.pointerId)
      onPanStart(event.clientX, event.clientY)
      return
    }
    if (activeTool === 'select') {
      if (event.target === event.currentTarget) onSelectShape(null)
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    onBeginDraw(activeTool, event.clientX, event.clientY)
  }

  const handleShapePointerDown = (
    id: string,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    onSelectShape(id)
    onBeginMove(event.clientX, event.clientY)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={gridStyle}
      onPointerDown={handlePointerDown}
    >
      {shapes.map((shape) => (
        <ShapeView
          key={shape.id}
          shape={shape}
          viewport={viewport}
          selected={selectedIds.includes(shape.id)}
          interactive={activeTool === 'select' && !spaceHeld}
          onSelect={handleShapePointerDown}
        />
      ))}
      {draft && (
        <ShapeView
          shape={draft}
          viewport={viewport}
          interactive={false}
          onSelect={() => {}}
        />
      )}
      {selectedShape && (
        <SelectionFrame
          shape={selectedShape}
          viewport={viewport}
          interactive={activeTool === 'select' && !spaceHeld}
          onResizeStart={onResizeStart}
        />
      )}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-md bg-black/60 px-2 py-1 text-xs tabular-nums text-neutral-300">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  )
}
