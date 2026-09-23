import type { ReactElement } from 'react'
import { SHAPE_TYPE_NAMES } from '../constants/shapes'
import type { Shape } from '../types/shape'

interface LayersPanelProps {
  shapes: Shape[]
  selectedIds: string[]
  onSelectShape: (id: string) => void
}

export function LayersPanel({ shapes, selectedIds, onSelectShape }: LayersPanelProps) {
  const childrenByParent = new Map<string, Shape[]>()
  const roots: Shape[] = []
  for (const shape of shapes) {
    if (shape.parentId) {
      const list = childrenByParent.get(shape.parentId) ?? []
      list.push(shape)
      childrenByParent.set(shape.parentId, list)
    } else {
      roots.push(shape)
    }
  }

  const renderShape = (shape: Shape, depth: number): ReactElement => {
    const isSelected = selectedIds.includes(shape.id)
    const children = childrenByParent.get(shape.id) ?? []
    return (
      <li key={shape.id}>
        <button
          type="button"
          onClick={() => onSelectShape(shape.id)}
          style={{ paddingLeft: 8 + depth * 14 }}
          className={`flex w-full items-center gap-2 rounded-md py-1 pr-2 text-left text-sm transition-colors ${
            isSelected
              ? 'bg-[#0d99ff]/20 text-white'
              : 'text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: shape.fill }}
          />
          {shape.name ?? SHAPE_TYPE_NAMES[shape.type]}
        </button>
        {children.length > 0 && (
          <ul className="flex flex-col gap-1">
            {children.toReversed().map((child) => renderShape(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <section className="rounded-xl bg-[#2c2c2c] p-3 shadow-xl">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Слои
      </h2>
      {roots.length === 0 ? (
        <p className="text-sm text-neutral-500">Пока пусто</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {roots.toReversed().map((shape) => renderShape(shape, 0))}
        </ul>
      )}
    </section>
  )
}
