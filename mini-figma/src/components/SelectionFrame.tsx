import type { ResizeHandle } from '../hooks/useResizing'
import type { Shape, Viewport } from '../types/shape'
import { canvasToScreen } from '../utils/geometry'

const HANDLE_SIZE_PX = 8
const HANDLES: ResizeHandle[] = ['nw', 'ne', 'sw', 'se']

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
}

interface SelectionFrameProps {
  shape: Shape
  viewport: Viewport
  interactive?: boolean
  onResizeStart: (handle: ResizeHandle) => void
}

export function SelectionFrame({
  shape,
  viewport,
  interactive = true,
  onResizeStart,
}: SelectionFrameProps) {
  const origin = canvasToScreen({ x: shape.x, y: shape.y }, viewport)
  const width = shape.width * viewport.zoom
  const height = shape.height * viewport.zoom

  return (
    <>
      <div
        className="pointer-events-none absolute border border-[#0d99ff]"
        style={{ left: origin.x, top: origin.y, width, height }}
      />
      {HANDLES.map((handle) => {
        const left = origin.x + (handle[1] === 'w' ? 0 : width) - HANDLE_SIZE_PX / 2
        const top = origin.y + (handle[0] === 'n' ? 0 : height) - HANDLE_SIZE_PX / 2
        return (
          <div
            key={handle}
            onPointerDown={
              interactive
                ? (event) => {
                    event.stopPropagation()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    onResizeStart(handle)
                  }
                : undefined
            }
            className="absolute rounded-[2px] border border-[#0d99ff] bg-white shadow-sm"
            style={{
              left,
              top,
              width: HANDLE_SIZE_PX,
              height: HANDLE_SIZE_PX,
              cursor: interactive ? HANDLE_CURSOR[handle] : 'default',
            }}
          />
        )
      })}
    </>
  )
}
