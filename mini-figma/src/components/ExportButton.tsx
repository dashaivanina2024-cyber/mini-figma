interface ExportButtonProps {
  disabled: boolean
  onExport: () => void
}

export function ExportButton({ disabled, onExport }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      className="w-full rounded-lg bg-[#0d99ff] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0b87e0] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Экспорт SVG
    </button>
  )
}
