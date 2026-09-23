import type { Shape } from '../types/shape'

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function shapeToSvgMarkup(shape: Shape): string {
  if (shape.type === 'ellipse') {
    const rx = shape.width / 2
    const ry = shape.height / 2
    return `<ellipse cx="${round(shape.x + rx)}" cy="${round(shape.y + ry)}" rx="${round(rx)}" ry="${round(ry)}" fill="${shape.fill}" />`
  }
  return `<rect x="${round(shape.x)}" y="${round(shape.y)}" width="${round(shape.width)}" height="${round(shape.height)}" fill="${shape.fill}" />`
}

export function shapesToSvgString(shapes: Shape[]): string {
  if (shapes.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"></svg>\n'
  }
  const minX = Math.min(...shapes.map((shape) => shape.x))
  const minY = Math.min(...shapes.map((shape) => shape.y))
  const maxX = Math.max(...shapes.map((shape) => shape.x + shape.width))
  const maxY = Math.max(...shapes.map((shape) => shape.y + shape.height))
  const width = round(maxX - minX)
  const height = round(maxY - minY)
  const body = shapes.map(shapeToSvgMarkup).join('\n  ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(minX)} ${round(minY)} ${width} ${height}" width="${width}" height="${height}">\n  ${body}\n</svg>\n`
}
