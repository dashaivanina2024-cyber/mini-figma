export type ShapeType = 'rectangle' | 'ellipse' | 'frame'

export type ToolId = 'select' | ShapeType

export type LayoutDirection = 'horizontal' | 'vertical'

export type LayoutSizing = 'fixed' | 'hug'

export interface AutoLayout {
  direction: LayoutDirection
  gap: number
  padding: number
  sizing?: LayoutSizing
}

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Shape extends Rect {
  id: string
  type: ShapeType
  name?: string
  parentId?: string
  layout?: AutoLayout
  fill: string
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}
