import { useCallback, useState } from 'react'
import { Canvas } from './components/Canvas'
import { ExportButton } from './components/ExportButton'
import { LayersPanel } from './components/LayersPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Toolbar } from './components/Toolbar'
import { useDrawing } from './hooks/useDrawing'
import { useHotkeys } from './hooks/useHotkeys'
import { useMoving } from './hooks/useMoving'
import { useResizing } from './hooks/useResizing'
import { useShapes } from './hooks/useShapes'
import { useViewport } from './hooks/useViewport'
import { downloadTextFile } from './utils/download'
import { shapesToSvgString } from './utils/svg'
import type { Rect, Shape, ToolId } from './types/shape'

export default function App() {
  const { viewport, containerRef, spaceHeld, isPanning, startPan } = useViewport()
  const { shapes, selectedIds, addShape, updateShape, moveShapes, deleteShapes, selectShape, undo, redo } =
    useShapes()
  const [activeTool, setActiveTool] = useState<ToolId>('select')

  const selectedShape =
    selectedIds.length === 1
      ? (shapes.find((shape) => shape.id === selectedIds[0]) ?? null)
      : null

  const { draft, beginDraw } = useDrawing({
    viewport,
    containerRef,
    onFinish: (shape: Shape) => {
      if (shape.type === 'frame') {
        const frameCount = shapes.filter((item) => item.type === 'frame').length
        addShape({ ...shape, name: `Фрейм ${frameCount + 1}` })
        return
      }
      addShape(shape)
    },
  })

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      moveShapes(selectedIds, dx, dy, 'move')
    },
    [moveShapes, selectedIds],
  )

  const { beginMove } = useMoving({ viewport, containerRef, onMove: handleMove })

  const handleResize = useCallback(
    (rect: Rect) => {
      if (selectedShape) updateShape(selectedShape.id, rect, 'resize')
    },
    [selectedShape, updateShape],
  )

  const { beginResize } = useResizing({
    viewport,
    containerRef,
    shape: selectedShape,
    onResize: handleResize,
  })

  const handleDelete = useCallback(() => {
    deleteShapes(selectedIds)
  }, [deleteShapes, selectedIds])

  const handleDeselect = useCallback(() => {
    selectShape(null)
  }, [selectShape])

  const handleExport = useCallback(() => {
    if (shapes.length === 0) return
    const date = new Date().toISOString().slice(0, 10)
    downloadTextFile(`mini-figma-${date}.svg`, shapesToSvgString(shapes), 'image/svg+xml')
  }, [shapes])

  useHotkeys({
    onToolSelect: setActiveTool,
    onDelete: handleDelete,
    onDeselect: handleDeselect,
    onNudge: handleMove,
    onExport: handleExport,
    onUndo: undo,
    onRedo: redo,
  })

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden font-sans text-white">
      <Canvas
        viewport={viewport}
        containerRef={containerRef}
        spaceHeld={spaceHeld}
        isPanning={isPanning}
        activeTool={activeTool}
        shapes={shapes}
        draft={draft}
        selectedIds={selectedIds}
        onPanStart={startPan}
        onBeginDraw={beginDraw}
        onBeginMove={beginMove}
        onResizeStart={beginResize}
        onSelectShape={selectShape}
      />
      <Toolbar activeTool={activeTool} onToolSelect={setActiveTool} />
      <div className="absolute right-4 top-4 z-10 flex w-60 flex-col gap-3">
        <ExportButton disabled={shapes.length === 0} onExport={handleExport} />
        <PropertiesPanel
          shape={selectedShape}
          selectedCount={selectedIds.length}
          onUpdateShape={(patch) => {
            if (selectedShape) updateShape(selectedShape.id, patch, 'edit')
          }}
        />
        <LayersPanel shapes={shapes} selectedIds={selectedIds} onSelectShape={selectShape} />
      </div>
    </div>
  )
}
