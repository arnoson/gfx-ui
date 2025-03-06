import type { Bounds, Color, Point } from '~/types'
import { drawPixel } from '~/utils/pixels'
import { drawLine } from './line'

export interface Circle {
  type: 'circle'
  id: number
  bounds: Bounds
  color: Color
  center: Point
  radius: number
  isFilled: boolean
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L357
const strokeCircle = (
  ctx: CanvasRenderingContext2D,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id' | 'bounds'>,
) => {
  const { x: x0, y: y0 } = center

  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r

  drawPixel(ctx, x0, y0 + r, color)
  drawPixel(ctx, x0, y0 - r, color)
  drawPixel(ctx, x0 + r, y0, color)
  drawPixel(ctx, x0 - r, y0, color)

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x

    drawPixel(ctx, x0 + x, y0 + y, color)
    drawPixel(ctx, x0 - x, y0 + y, color)
    drawPixel(ctx, x0 + x, y0 - y, color)
    drawPixel(ctx, x0 - x, y0 - y, color)
    drawPixel(ctx, x0 + y, y0 + x, color)
    drawPixel(ctx, x0 - y, y0 + x, color)
    drawPixel(ctx, x0 + y, y0 - x, color)
    drawPixel(ctx, x0 - y, y0 - x, color)
  }
}

const fillCircle = (
  ctx: CanvasRenderingContext2D,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id'>,
) => {
  const { x: x0, y: y0 } = center
  const from = { x: x0, y: y0 - r }
  const to = { x: from.x, y: from.y + 2 * r }
  drawLine(ctx, { from, to, color })

  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r
  let px = x
  let py = y

  let delta = 1
  let corners = 3

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x
    if (x < y + 1) {
      if (corners & 1) {
        const from = { x: x0 + x, y: y0 - y }
        const to = { x: from.x, y: from.y + 2 * y + delta - 1 }
        drawLine(ctx, { from, to, color })
      }
      if (corners & 2) {
        const from = { x: x0 - x, y: y0 - y }
        const to = { x: from.x, y: from.y + 2 * y + delta - 1 }
        drawLine(ctx, { from, to, color })
      }
    }
    if (y != py) {
      if (corners & 1) {
        const from = { x: x0 + py, y: y0 - px }
        const to = { x: from.x, y: from.y + 2 * px + delta - 1 }
        drawLine(ctx, { from, to, color })
      }
      if (corners & 2) {
        const from = { x: x0 - py, y: y0 - px }
        const to = { x: from.x, y: from.y + 2 * px + delta - 1 }
        drawLine(ctx, { from, to, color })
      }
      py = y
    }
    px = x
  }
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Omit<Circle, 'type' | 'id'>,
) => {
  if (circle.isFilled) fillCircle(ctx, circle)
  else strokeCircle(ctx, circle)
}

export const translateCircle = (circle: Circle, delta: Point) => {
  circle.center.x += delta.x
  circle.center.y += delta.y
}

export const moveCircle = (circle: Circle, position: Point) => {
  circle.center.x = position.x + circle.radius
  circle.center.y = position.y + circle.radius
}
