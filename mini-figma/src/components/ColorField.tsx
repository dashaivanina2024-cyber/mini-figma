import { useEffect, useRef, useState } from 'react'
import { formatHex, normalizeHex } from '../utils/color'

interface ColorFieldProps {
  color: string
  onChange: (color: string) => void
}

export function ColorField({ color, onChange }: ColorFieldProps) {
  const [text, setText] = useState(() => formatHex(color))
  const isEditingRef = useRef(false)

  useEffect(() => {
    if (!isEditingRef.current) setText(formatHex(color))
  }, [color])

  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-6 w-6 shrink-0 cursor-pointer rounded-md border border-white/25"
        style={{ background: color }}
      >
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        value={text}
        spellCheck={false}
        onFocus={() => {
          isEditingRef.current = true
        }}
        onBlur={() => {
          isEditingRef.current = false
          setText(formatHex(color))
        }}
        onChange={(event) => {
          setText(event.target.value)
          const normalized = normalizeHex(event.target.value)
          if (normalized) onChange(normalized)
        }}
        placeholder="HEX"
        className="min-w-0 flex-1 rounded-md bg-[#383838] px-2 py-1 text-xs uppercase tabular-nums text-neutral-200 outline-none placeholder:normal-case placeholder:text-neutral-500 focus:text-white"
      />
    </div>
  )
}
