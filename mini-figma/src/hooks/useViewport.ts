import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Viewport } from '../types/shape'
import { panViewport, zoomViewportAtPoint } from '../utils/geometry'

const PINCH_ZOOM_SPEED = 0.01
const WHEEL_ZOOM_SPEED = 0.0015
const MOUSE_WHEEL_MIN_DELTA = 30

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export function useViewport() {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const panLastRef = useRef<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setViewport((vp) =>
      vp.x === 0 && vp.y === 0 ? { ...vp, x: width / 2, y: height / 2 } : vp,
    )
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isEditableTarget(event.target)) return
      event.preventDefault()
      if (!event.repeat) setSpaceHeld(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceHeld(false)
    }
    const onBlur = () => {
      setSpaceHeld(false)
      setIsPanning(false)
      panLastRef.current = null
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    if (!isPanning) return
    const onPointerMove = (event: PointerEvent) => {
      const last = panLastRef.current
      if (!last) return
      const dx = event.clientX - last.x
      const dy = event.clientY - last.y
      panLastRef.current = { x: event.clientX, y: event.clientY }
      setViewport((vp) => panViewport(vp, dx, dy))
    }
    const onPointerUp = () => {
      panLastRef.current = null
      setIsPanning(false)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isPanning])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      const isPinch = event.ctrlKey || event.metaKey
      const isMouseWheel =
        !isPinch &&
        event.deltaMode === 0 &&
        event.deltaX === 0 &&
        Math.abs(event.deltaY) >= MOUSE_WHEEL_MIN_DELTA &&
        Number.isInteger(event.deltaY)

      if (isPinch || isMouseWheel) {
        const speed = isPinch ? PINCH_ZOOM_SPEED : WHEEL_ZOOM_SPEED
        setViewport((vp) => zoomViewportAtPoint(vp, vp.zoom * Math.exp(-event.deltaY * speed), point))
      } else {
        setViewport((vp) => panViewport(vp, -event.deltaX, -event.deltaY))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const startPan = useCallback((x: number, y: number) => {
    panLastRef.current = { x, y }
    setIsPanning(true)
  }, [])

  return { viewport, containerRef, spaceHeld, isPanning, startPan }
}
