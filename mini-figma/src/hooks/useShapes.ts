import { useCallback, useEffect, useRef, useState } from 'react'
import type { Shape } from '../types/shape'
import {
  collectDescendantIds,
  findEnclosingFrame,
  reparentShapes,
  settleLayout,
} from '../utils/layout'

interface Snapshot {
  shapes: Shape[]
  selectedIds: string[]
}

interface History {
  past: Snapshot[]
  future: Snapshot[]
}

const HISTORY_LIMIT = 100
const COALESCE_INTERVAL_MS = 500
const SETTLE_DELAY_MS = 150

export function useShapes() {
  const [shapes, setShapesState] = useState<Shape[]>([])
  const [selectedIds, setSelectedIdsState] = useState<string[]>([])
  const [history, setHistoryState] = useState<History>({ past: [], future: [] })

  const shapesRef = useRef(shapes)
  const selectedIdsRef = useRef(selectedIds)
  const historyRef = useRef(history)
  const lastActionRef = useRef<{ tag: string; time: number } | null>(null)
  const settleTimerRef = useRef<number | null>(null)
  const pendingReparentIdsRef = useRef<Set<string> | null>(null)

  const getSnapshot = useCallback(
    (): Snapshot => ({ shapes: shapesRef.current, selectedIds: selectedIdsRef.current }),
    [],
  )

  const applySnapshot = useCallback((snapshot: Snapshot) => {
    shapesRef.current = snapshot.shapes
    selectedIdsRef.current = snapshot.selectedIds
    setShapesState(snapshot.shapes)
    setSelectedIdsState(snapshot.selectedIds)
  }, [])

  const replaceHistory = useCallback((next: History) => {
    historyRef.current = next
    setHistoryState(next)
  }, [])

  const pushHistory = useCallback(
    (tag?: string) => {
      const now = Date.now()
      const last = lastActionRef.current
      if (tag && last && last.tag === tag && now - last.time < COALESCE_INTERVAL_MS) {
        lastActionRef.current = { tag, time: now }
        return
      }
      lastActionRef.current = tag ? { tag, time: now } : null
      const current = historyRef.current
      replaceHistory({
        past: [...current.past, getSnapshot()].slice(-HISTORY_LIMIT),
        future: [],
      })
    },
    [getSnapshot, replaceHistory],
  )

  const cancelSettle = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
    pendingReparentIdsRef.current = null
  }, [])

  const runSettle = useCallback(() => {
    const current = shapesRef.current
    const pending = pendingReparentIdsRef.current
    pendingReparentIdsRef.current = null
    let next = pending && pending.size > 0 ? reparentShapes(current, pending) : current
    next = settleLayout(next)
    if (next !== current) {
      shapesRef.current = next
      setShapesState(next)
    }
  }, [])

  const scheduleSettle = useCallback(() => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      runSettle()
    }, SETTLE_DELAY_MS)
  }, [runSettle])

  useEffect(
    () => () => {
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    },
    [],
  )

  const finishMutation = useCallback(
    (tag: string | undefined, movedIds?: ReadonlySet<string>) => {
      if (tag) {
        if (movedIds) {
          const pending = pendingReparentIdsRef.current ?? new Set<string>()
          for (const id of movedIds) pending.add(id)
          pendingReparentIdsRef.current = pending
        }
        scheduleSettle()
        return
      }
      cancelSettle()
      runSettle()
    },
    [cancelSettle, runSettle, scheduleSettle],
  )

  const addShape = useCallback(
    (shape: Shape) => {
      pushHistory()
      const parent = findEnclosingFrame(shapesRef.current, {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
      })
      const next = [...shapesRef.current, { ...shape, parentId: parent?.id }]
      shapesRef.current = next
      setShapesState(next)
      finishMutation(undefined)
    },
    [finishMutation, pushHistory],
  )

  const updateShape = useCallback(
    (id: string, patch: Partial<Omit<Shape, 'id'>>, tag?: string) => {
      if (!shapesRef.current.some((shape) => shape.id === id)) return
      pushHistory(tag)
      const next = shapesRef.current.map((shape) =>
        shape.id === id ? { ...shape, ...patch } : shape,
      )
      shapesRef.current = next
      setShapesState(next)
      finishMutation(tag)
    },
    [finishMutation, pushHistory],
  )

  const moveShapes = useCallback(
    (ids: string[], dx: number, dy: number, tag?: string) => {
      if (ids.length === 0) return
      const targetIds = collectDescendantIds(shapesRef.current, ids)
      pushHistory(tag)
      const next = shapesRef.current.map((shape) =>
        targetIds.has(shape.id) ? { ...shape, x: shape.x + dx, y: shape.y + dy } : shape,
      )
      shapesRef.current = next
      setShapesState(next)
      finishMutation(tag, targetIds)
    },
    [finishMutation, pushHistory],
  )

  const deleteShapes = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const targetIds = collectDescendantIds(shapesRef.current, ids)
      pushHistory()
      const nextShapes = shapesRef.current.filter((shape) => !targetIds.has(shape.id))
      const nextSelected = selectedIdsRef.current.filter((id) => !targetIds.has(id))
      shapesRef.current = nextShapes
      selectedIdsRef.current = nextSelected
      setShapesState(nextShapes)
      setSelectedIdsState(nextSelected)
      finishMutation(undefined)
    },
    [finishMutation, pushHistory],
  )

  const selectShape = useCallback((id: string | null) => {
    const next = id ? [id] : []
    selectedIdsRef.current = next
    setSelectedIdsState(next)
  }, [])

  const undo = useCallback(() => {
    const current = historyRef.current
    if (current.past.length === 0) return
    cancelSettle()
    const previous = current.past[current.past.length - 1]
    replaceHistory({
      past: current.past.slice(0, -1),
      future: [getSnapshot(), ...current.future],
    })
    applySnapshot(previous)
    lastActionRef.current = null
  }, [applySnapshot, cancelSettle, getSnapshot, replaceHistory])

  const redo = useCallback(() => {
    const current = historyRef.current
    if (current.future.length === 0) return
    cancelSettle()
    const next = current.future[0]
    replaceHistory({
      past: [...current.past, getSnapshot()],
      future: current.future.slice(1),
    })
    applySnapshot(next)
    lastActionRef.current = null
  }, [applySnapshot, cancelSettle, getSnapshot, replaceHistory])

  return {
    shapes,
    selectedIds,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    addShape,
    updateShape,
    moveShapes,
    deleteShapes,
    selectShape,
    undo,
    redo,
  }
}
