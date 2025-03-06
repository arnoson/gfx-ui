import type { Bounds, Color, Pixels, Point, Size } from '~/types'
import { drawLine } from './line'
import { pixelColors } from '~/utils/pixels'

export interface Rect {
  type: 'rect'
  id: number
  bounds: Bounds
  position: Point
  size: Size
  color: Color
  isFilled: boolean
}

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  { position, size, color, isFilled }: Omit<Rect, 'type' | 'id' | 'bounds'>,
) => {
  const left = position.x
  const top = position.y
  const right = position.x + size.width - 1
  const bottom = position.y + size.height - 1

  const topLeft = position
  const topRight = { x: right, y: top }
  const bottomLeft = { x: left, y: bottom }
  const bottomRight = { x: right, y: bottom }

  if (isFilled) {
    ctx.fillStyle = pixelColors[color]
    ctx.fillRect(left, top, size.width, size.height)
  } else {
    drawLine(ctx, { from: topLeft, to: topRight, color })
    drawLine(ctx, { from: bottomLeft, to: bottomRight, color })
    drawLine(ctx, { from: topLeft, to: bottomLeft, color })
    drawLine(ctx, { from: topRight, to: bottomRight, color })
  }
}

export const translateRect = (rect: Rect, delta: Point) => {
  rect.position.x += delta.x
  rect.position.y += delta.y
}

export const moveRect = (rect: Rect, position: Point) => {
  rect.position = position
}
