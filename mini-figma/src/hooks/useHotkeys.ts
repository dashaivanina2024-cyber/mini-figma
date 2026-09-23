import { useEffect, useRef } from 'react'
import { TOOL_HOTKEYS } from '../constants/tools'
import type { Point, ToolId } from '../types/shape'

export interface HotkeyHandlers {
  onToolSelect: (tool: ToolId) => void
  onDelete: () => void
  onDeselect: () => void
  onNudge: (dx: number, dy: number) => void
  onExport?: () => void
  onUndo?: () => void
  onRedo?: () => void
}

const NUDGE_STEPS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
}

const NUDGE_BIG_STEP = 10

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export function useHotkeys(handlers: HotkeyHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        handlersRef.current.onDelete()
        return
      }

      if (event.key === 'Escape') {
        handlersRef.current.onDeselect()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        handlersRef.current.onExport?.()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) handlersRef.current.onRedo?.()
        else handlersRef.current.onUndo?.()
        return
      }

      const nudge = NUDGE_STEPS[event.key]
      if (nudge) {
        event.preventDefault()
        const scale = event.shiftKey ? NUDGE_BIG_STEP : 1
        handlersRef.current.onNudge(nudge.x * scale, nudge.y * scale)
        return
      }

      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const tool = TOOL_HOTKEYS[event.key.toLowerCase()]
      if (tool) handlersRef.current.onToolSelect(tool)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
