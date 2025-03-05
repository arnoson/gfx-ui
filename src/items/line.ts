import type { Bounds, Color, Pixels, Point } from '~/types'
import { drawPixel, packPixel } from '~/utils/pixels'

export interface Line {
  type: 'line'
  id: number
  bounds: Bounds
  color: Color
  from: Point
  to: Point
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L132
export const drawLine = (
  ctx: CanvasRenderingContext2D,
  { from, to, color }: Omit<Line, 'type' | 'id' | 'bounds'>,
) => {
  let { x: x0, y: y0 } = from
  let { x: x1, y: y1 } = to

  const isSteep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (isSteep) {
    // Swap x0 with y0.
    let temp = x0
    x0 = y0
    y0 = temp
    // Swap x1 with y1.
    temp = x1
    x1 = y1
    y1 = temp
  }

  if (x0 > x1) {
    // Swap x0 with x1.
    let temp = x0
    x0 = x1
    x1 = temp
    // Swap y0 with y1.
    temp = y0
    y0 = y1
    y1 = temp
  }

  const dx = x1 - x0
  const dy = Math.abs(y1 - y0)

  let err = dx / 2
  let yStep

  if (y0 < y1) yStep = 1
  else yStep = -1

  for (; x0 <= x1; x0++) {
    if (isSteep) drawPixel(ctx, y0, x0, color)
    else drawPixel(ctx, x0, y0, color)

    err -= dy
    if (err < 0) {
      y0 += yStep
      err += dx
    }
  }
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L132
export const getLinePixels = (from: Point, to: Point) => {
  const pixels: Pixels = new Set()

  let { x: x0, y: y0 } = from
  let { x: x1, y: y1 } = to

  const isSteep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (isSteep) {
    // Swap x0 with y0.
    let temp = x0
    x0 = y0
    y0 = temp
    // Swap x1 with y1.
    temp = x1
    x1 = y1
    y1 = temp
  }

  if (x0 > x1) {
    // Swap x0 with x1.
    let temp = x0
    x0 = x1
    x1 = temp
    // Swap y0 with y1.
    temp = y0
    y0 = y1
    y1 = temp
  }

  const dx = x1 - x0
  const dy = Math.abs(y1 - y0)

  let err = dx / 2
  let yStep

  if (y0 < y1) yStep = 1
  else yStep = -1

  for (; x0 <= x1; x0++) {
    if (isSteep) pixels.add(packPixel(y0, x0))
    else pixels.add(packPixel(x0, y0))

    err -= dy
    if (err < 0) {
      y0 += yStep
      err += dx
    }
  }

  return pixels
}
