import type { Frame } from '~/frame'
import { drawItem, type DrawContext } from '~/items/item'

export const frameToSvg = (
  frame: Frame,
  colors: Array<{ value: number; color: string; label: string }>,
): string => {
  // Custom draw context that collects pixels instead of drawing to canvas
  const pixelMap = new Map<string, number>()
  const svgDrawContext: DrawContext = {
    drawPixel(x: number, y: number, color: number) {
      const key = `${Math.floor(x)},${Math.floor(y)}`
      pixelMap.set(key, color)
    },
  }

  for (const item of frame.children.toReversed()) drawItem(svgDrawContext, item)

  const { width, height } = frame.size
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`

  for (const [position, colorIndex] of pixelMap) {
    const [x, y] = position.split(',').map(Number)
    const color = colors[colorIndex]?.color || '#000000'

    // Skip transparent/background pixels
    if (colorIndex === 0) continue

    svg += `  <rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>\n`
  }

  svg += '</svg>'
  return svg
}
