import type { ToolId } from '../types/shape'

export interface ToolDef {
  id: ToolId
  name: string
  hotkey: string
}

export const TOOLS: ToolDef[] = [
  { id: 'select', name: 'Выделение', hotkey: 'V' },
  { id: 'frame', name: 'Фрейм', hotkey: 'F' },
  { id: 'rectangle', name: 'Прямоугольник', hotkey: 'R' },
  { id: 'ellipse', name: 'Эллипс', hotkey: 'O' },
]

export const TOOL_HOTKEYS: Record<string, ToolId> = Object.fromEntries(
  TOOLS.map((tool) => [tool.hotkey.toLowerCase(), tool.id]),
)
