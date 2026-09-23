import { useEffect, useRef, useState } from 'react'
import {
  AUTO_LAYOUT_DEFAULTS,
  PRESET_COLORS,
  SHAPE_TYPE_NAMES,
} from '../constants/shapes'
import type { AutoLayout, Shape } from '../types/shape'
import { ColorField } from './ColorField'

interface PropertiesPanelProps {
  shape: Shape | null
  selectedCount: number
  onUpdateShape: (patch: Partial<Omit<Shape, 'id'>>) => void
}

interface NumberFieldProps {
  label: string
  value: number
  onCommit: (value: number) => void
}

function NumberField({ label, value, onCommit }: NumberFieldProps) {
  const [text, setText] = useState(() => String(Math.round(value)))
  const isEditingRef = useRef(false)

  useEffect(() => {
    if (!isEditingRef.current) setText(String(Math.round(value)))
  }, [value])

  return (
    <label className="flex items-center gap-1.5 rounded-md bg-[#383838] px-2 py-1 text-xs text-neutral-400">
      {label}
      <input
        value={text}
        inputMode="numeric"
        onFocus={() => {
          isEditingRef.current = true
        }}
        onBlur={() => {
          isEditingRef.current = false
          setText(String(Math.round(value)))
        }}
        onChange={(event) => {
          setText(event.target.value)
          const parsed = Number(event.target.value)
          if (event.target.value.trim() !== '' && Number.isFinite(parsed)) {
            onCommit(parsed)
          }
        }}
        className="w-full min-w-0 bg-transparent text-neutral-200 tabular-nums outline-none"
      />
    </label>
  )
}

interface AutoLayoutSectionProps {
  layout: AutoLayout
  onChange: (layout: AutoLayout | undefined) => void
}

function AutoLayoutSection({ layout, onChange }: AutoLayoutSectionProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className="w-full rounded-md bg-[#0d99ff] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#0b87e0]"
      >
        Auto layout включён
      </button>
      <div className="grid grid-cols-2 gap-1.5">
        {(['horizontal', 'vertical'] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => onChange({ ...layout, direction })}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              layout.direction === direction
                ? 'bg-[#0d99ff] text-white'
                : 'bg-[#383838] text-neutral-300 hover:bg-white/10'
            }`}
          >
            {direction === 'horizontal' ? '→ Ряд' : '↓ Столбец'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {(['fixed', 'hug'] as const).map((sizing) => (
          <button
            key={sizing}
            type="button"
            title={
              sizing === 'fixed'
                ? 'Размер фрейма не меняется'
                : 'Фрейм подстраивается под содержимое'
            }
            onClick={() => onChange({ ...layout, sizing })}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              (layout.sizing ?? 'fixed') === sizing
                ? 'bg-[#0d99ff] text-white'
                : 'bg-[#383838] text-neutral-300 hover:bg-white/10'
            }`}
          >
            {sizing === 'fixed' ? 'Фикс' : 'Подгон'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <NumberField
          label="Зазор"
          value={layout.gap}
          onCommit={(gap) => onChange({ ...layout, gap: Math.max(0, gap) })}
        />
        <NumberField
          label="Отступ"
          value={layout.padding}
          onCommit={(padding) => onChange({ ...layout, padding: Math.max(0, padding) })}
        />
      </div>
    </>
  )
}

export function PropertiesPanel({ shape, selectedCount, onUpdateShape }: PropertiesPanelProps) {
  const frameLayout = shape?.type === 'frame' ? shape.layout : undefined

  return (
    <section className="rounded-xl bg-[#2c2c2c] p-3 shadow-xl">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Свойства
      </h2>
      {!shape ? (
        <p className="text-sm text-neutral-500">
          {selectedCount > 1 ? `Выбрано элементов: ${selectedCount}` : 'Ничего не выбрано'}
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: shape.fill }}
            />
            {shape.name ?? SHAPE_TYPE_NAMES[shape.type]}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumberField
              label="X"
              value={shape.x}
              onCommit={(x) => onUpdateShape({ x })}
            />
            <NumberField
              label="Y"
              value={shape.y}
              onCommit={(y) => onUpdateShape({ y })}
            />
            <NumberField
              label="Ш"
              value={shape.width}
              onCommit={(width) => onUpdateShape({ width })}
            />
            <NumberField
              label="В"
              value={shape.height}
              onCommit={(height) => onUpdateShape({ height })}
            />
          </div>
          <h3 className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Заливка
          </h3>
          <ColorField color={shape.fill} onChange={(fill) => onUpdateShape({ fill })} />
          <div className="mt-2 grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((preset) => {
              const isActive = preset === shape.fill
              return (
                <button
                  key={preset}
                  type="button"
                  title={preset}
                  onClick={() => onUpdateShape({ fill: preset })}
                  className={`h-5 w-full rounded-md border transition-shadow ${
                    isActive
                      ? 'border-[#0d99ff] ring-1 ring-[#0d99ff]'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{ background: preset }}
                />
              )
            })}
          </div>
          {shape.type === 'frame' && (
            <>
              <h3 className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Auto layout
              </h3>
              <div className="flex flex-col gap-1.5">
                {frameLayout ? (
                  <AutoLayoutSection
                    layout={frameLayout}
                    onChange={(next) => onUpdateShape({ layout: next })}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpdateShape({ layout: AUTO_LAYOUT_DEFAULTS })}
                    className="w-full rounded-md bg-[#383838] px-2 py-1 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    + Включить Auto layout
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
