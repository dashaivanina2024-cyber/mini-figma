import type { AutoLayout, Shape } from '../types/shape'

export function collectDescendantIds(
  shapes: Shape[],
  ids: Iterable<string>,
): Set<string> {
  const result = new Set(ids)
  let grew = true
  while (grew) {
    grew = false
    for (const shape of shapes) {
      if (result.has(shape.id)) continue
      if (shape.parentId && result.has(shape.parentId)) {
        result.add(shape.id)
        grew = true
      }
    }
  }
  return result
}

export function findEnclosingFrame(
  shapes: Shape[],
  point: { x: number; y: number },
  excludeId?: string,
): Shape | null {
  let found: Shape | null = null
  for (const shape of shapes) {
    if (shape.type !== 'frame' || shape.id === excludeId) continue
    if (point.x < shape.x || point.x > shape.x + shape.width) continue
    if (point.y < shape.y || point.y > shape.y + shape.height) continue
    found = shape
  }
  return found
}

export function reparentShapes(
  shapes: Shape[],
  ids: ReadonlySet<string>,
): Shape[] {
  return shapes.map((shape) => {
    if (!ids.has(shape.id)) return shape
    const center = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 }
    const parent = findEnclosingFrame(shapes, center, shape.id)
    const nextParentId = parent?.id
    if (shape.parentId === nextParentId) return shape
    return { ...shape, parentId: nextParentId }
  })
}

export function settleLayout(shapes: Shape[]): Shape[] {
  let working = shapes
  const maxPasses = shapes.length + 2
  for (let pass = 0; pass < maxPasses; pass++) {
    const result = settlePass(working)
    if (result === working) return working
    working = result
  }
  return working
}

function settlePass(shapes: Shape[]): Shape[] {
  let working = shapes
  let changed = false

  const frames = shapes.filter(
    (shape): shape is Shape & { layout: AutoLayout } =>
      shape.type === 'frame' && shape.layout !== undefined,
  )

  for (const frameRef of frames) {
    const frame = working.find((shape) => shape.id === frameRef.id)
    if (!frame || !frame.layout) continue
    const layout = frame.layout
    const children = working.filter((shape) => shape.parentId === frame.id)
    if (children.length === 0) continue

    const pad = Math.max(0, layout.padding)
    const gap = Math.max(0, layout.gap)
    const horizontal = layout.direction === 'horizontal'
    const sizing = layout.sizing === 'hug' ? 'hug' : 'fixed'
    const mainOf = (shape: Shape) => (horizontal ? shape.width : shape.height)
    const crossOf = (shape: Shape) => (horizontal ? shape.height : shape.width)

    let frameWidth = frame.width
    let frameHeight = frame.height

    if (sizing === 'hug') {
      const contentMain =
        children.reduce((sum, child) => sum + mainOf(child), 0) +
        gap * (children.length - 1)
      const crossMax = Math.max(...children.map(crossOf))
      frameWidth = horizontal ? pad * 2 + contentMain : pad * 2 + crossMax
      frameHeight = horizontal ? pad * 2 + crossMax : pad * 2 + contentMain
      if (frameWidth !== frame.width || frameHeight !== frame.height) changed = true
    }

    const updates = new Map<string, Shape>()
    if (frameWidth !== frame.width || frameHeight !== frame.height) {
      updates.set(frame.id, { ...frame, width: frameWidth, height: frameHeight })
    }

    const crossBox = (horizontal ? frameHeight : frameWidth) - pad * 2
    let cursor = (horizontal ? frame.x : frame.y) + pad

    for (const child of children) {
      const crossOffset = (crossBox - crossOf(child)) / 2
      const x = horizontal ? cursor : frame.x + pad + crossOffset
      const y = horizontal ? frame.y + pad + crossOffset : cursor
      if (x !== child.x || y !== child.y) changed = true
      updates.set(child.id, { ...child, x, y })
      cursor += mainOf(child) + gap
    }

    working = working.map((shape) => updates.get(shape.id) ?? shape)
  }

  return changed ? working : shapes
}
