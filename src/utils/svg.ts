import type { Frame } from '~/frame'
import { drawItem, type DrawContext } from '~/items/item'

export const frameToSvg = (
  frame: Frame,
  colors: Array<{ value: number; color: string; label: string }>,
): string => {
  // Custom draw context that collects pixels instead of drawing to canvas.
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

  // Group pixels by color index.
  const colorPixels = new Map<number, Set<string>>()
  for (const [key, colorIndex] of pixelMap) {
    if (colorIndex === 0) continue
    if (!colorPixels.has(colorIndex)) colorPixels.set(colorIndex, new Set())
    colorPixels.get(colorIndex)!.add(key)
  }

  // Find connected components via BFS (4-connectivity)
  const components: Array<{ colorIndex: number; pixels: Set<string> }> = []
  for (const [colorIndex, pixels] of colorPixels) {
    const remaining = new Set(pixels)
    while (remaining.size > 0) {
      const start = remaining.values().next().value!
      const component = new Set<string>()
      const queue = [start]
      while (queue.length > 0) {
        const key = queue.pop()!
        if (!remaining.has(key)) continue
        remaining.delete(key)
        component.add(key)
        const [x, y] = key.split(',').map(Number)
        for (const neighbor of [
          `${x},${y - 1}`,
          `${x + 1},${y - 1}`,
          `${x + 1},${y}`,
          `${x + 1},${y + 1}`,
          `${x},${y + 1}`,
          `${x - 1},${y + 1}`,
          `${x - 1},${y}`,
          `${x - 1},${y - 1}`,
        ]) {
          if (remaining.has(neighbor)) queue.push(neighbor)
        }
      }
      components.push({ colorIndex, pixels: component })
    }
  }

  for (const { colorIndex, pixels } of components) {
    const color = colors[colorIndex]?.color || '#000000'

    // Collect directed boundary edges as an adjacency list (multiple edges per
    // vertex are possible at "saddle corners" where only diagonally-opposite
    // pixels are filled).
    const edgeMap = new Map<string, string[]>()
    const addEdge = (from: string, to: string) => {
      const existing = edgeMap.get(from)
      if (existing) existing.push(to)
      else edgeMap.set(from, [to])
    }

    for (const key of pixels) {
      const [x, y] = key.split(',').map(Number)

      if (!pixels.has(`${x},${y - 1}`)) {
        addEdge(`${x},${y}`, `${x + 1},${y}`)
      }
      if (!pixels.has(`${x + 1},${y}`)) {
        addEdge(`${x + 1},${y}`, `${x + 1},${y + 1}`)
      }
      if (!pixels.has(`${x},${y + 1}`)) {
        addEdge(`${x + 1},${y + 1}`, `${x},${y + 1}`)
      }
      if (!pixels.has(`${x - 1},${y}`)) {
        addEdge(`${x},${y + 1}`, `${x},${y}`)
      }
    }

    // Chain edges into closed polygon loops. At saddle corners with two
    // outgoing edges, we pick whichever is unused — each outgoing edge always
    // belongs to a distinct loop.
    const usedEdges = new Set<string>()
    let pathData = ''

    for (const [startKey, tos] of edgeMap) {
      for (const startTo of tos) {
        if (usedEdges.has(`${startKey}:${startTo}`)) continue

        const coords: string[] = []
        let from = startKey
        let to = startTo

        while (!usedEdges.has(`${from}:${to}`)) {
          usedEdges.add(`${from}:${to}`)
          coords.push(from.replace(',', ' '))
          const nextTos = edgeMap.get(to)
          if (!nextTos) break
          const next = nextTos.find((t) => !usedEdges.has(`${to}:${t}`))
          if (!next) break
          from = to
          to = next
        }

        if (coords.length >= 3) pathData += `M ${coords.join(' L ')} Z `
      }
    }

    svg += `  <path d="${pathData.trim()}" fill="${color}" fill-rule="evenodd"/>\n`
  }

  svg += '</svg>'
  return svg
}
