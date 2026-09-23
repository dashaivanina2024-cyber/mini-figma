const HEX_PATTERN = /^[0-9a-f]{3}([0-9a-f]{3})?$/i

export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '')
  if (!HEX_PATTERN.test(value)) return null
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value
  return `#${full.toLowerCase()}`
}

export function formatHex(color: string): string {
  return color.replace(/^#/, '').toUpperCase()
}
