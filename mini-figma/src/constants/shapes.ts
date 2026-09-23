import type { AutoLayout, ShapeType } from '../types/shape'

export const DEFAULT_FILLS: Record<ShapeType, string> = {
  rectangle: '#9747ff',
  ellipse: '#0ba5ec',
  frame: '#ffffff',
}

export const SHAPE_TYPE_NAMES: Record<ShapeType, string> = {
  rectangle: 'Прямоугольник',
  ellipse: 'Эллипс',
  frame: 'Фрейм',
}

export const MIN_DRAG_SIZE_PX = 4

export const AUTO_LAYOUT_DEFAULTS: AutoLayout = {
  direction: 'horizontal',
  gap: 10,
  padding: 10,
  sizing: 'fixed',
}

export const PRESET_COLORS: string[] = [
  '#ffffff',
  '#1e1e1e',
  '#9747ff',
  '#0ba5ec',
  '#0fa958',
  '#ffcd29',
  '#f24822',
  '#ff7ab6',
]
