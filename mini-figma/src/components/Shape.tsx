import type { Shape, Viewport } from '../types/shape'
import { canvasToScreen } from '../utils/geometry'

interface ShapeViewProps {
  shape: Shape
  viewport: Viewport
  selected?: boolean
  interactive?: boolean
  onSelect: (id: string, event: React.PointerEvent<HTMLDivElement>) => void
}

export function ShapeView({
  shape,
  viewport,
  selected = false,
  interactive = true,
  onSelect,
}: ShapeViewProps) {
  const origin = canvasToScreen({ x: shape.x, y: shape.y }, viewport)
  const isFrame = shape.type === 'frame'

  return (
    <>
      <div
        onPointerDown={
          interactive
            ? (event) => {
                event.stopPropagation()
                event.currentTarget.setPointerCapture(event.pointerId)
                onSelect(shape.id, event)
              }
            : undefined
        }
        style={{
          position: 'absolute',
          left: origin.x,
          top: origin.y,
          width: shape.width * viewport.zoom,
          height: shape.height * viewport.zoom,
          background: shape.fill,
          borderRadius: shape.type === 'ellipse' ? '50%' : '0px',
          boxShadow: isFrame ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.14)' : undefined,
          cursor: interactive ? 'move' : undefined,
        }}
      />
      {isFrame && (
        <span
          style={{
            position: 'absolute',
            left: origin.x,
            top: origin.y - 18,
            fontSize: 11,
            lineHeight: '16px',
            color: selected ? '#0d99ff' : 'rgba(255, 255, 255, 0.45)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {shape.name ?? 'Фрейм'}
        </span>
      )}
    </>
  )
}
