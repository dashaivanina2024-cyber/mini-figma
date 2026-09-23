import { TOOLS } from '../constants/tools'
import type { ToolId } from '../types/shape'

interface ToolbarProps {
  activeTool: ToolId
  onToolSelect: (tool: ToolId) => void
}

export function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  return (
    <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl bg-[#2c2c2c] p-1.5 shadow-xl">
      {TOOLS.map((tool) => {
        const isActive = tool.id === activeTool
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.name} (${tool.hotkey})`}
            onClick={() => onToolSelect(tool.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#0d99ff] text-white'
                : 'text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tool.hotkey}
          </button>
        )
      })}
    </div>
  )
}
