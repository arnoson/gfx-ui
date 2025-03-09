import type { Bounds, Color, Pixels, Point } from '~/types'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { drawPixel, packPixel, unpackPixel } from '~/utils/pixels'

export interface Bitmap {
  type: 'bitmap'
  id: number
  bounds: Bounds
  pixels: Pixels
  color: Color
}

export const drawBitmap = (
  ctx: CanvasRenderingContext2D,
  { pixels, color }: Omit<Bitmap, 'type' | 'id' | 'bounds'>,
) => {
  for (const pixel of pixels) {
    const { x, y } = unpackPixel(pixel)
    drawPixel(ctx, x, y, color)
  }
}

export const translateBitmap = (bitmap: Bitmap, delta: Point) => {
  const translatedPixels: Pixels = new Set()
  for (const pixel of bitmap.pixels) {
    const { x, y } = unpackPixel(pixel)
    translatedPixels.add(packPixel(x + delta.x, y + delta.y))
  }
  bitmap.pixels = translatedPixels
}

export const moveBitmap = (bitmap: Bitmap, position: Point) => {
  const delta = {
    x: position.x - bitmap.bounds.left,
    y: position.y - bitmap.bounds.top,
  }
  translateBitmap(bitmap, delta)
}

export const getBitmapBounds = (bitmap: { pixels: Pixels }): Bounds => {
  if (!bitmap.pixels.size) return emptyBounds

  let top = Infinity
  let left = Infinity
  let bottom = 0
  let right = 0

  for (const pixel of bitmap.pixels) {
    const { x, y } = unpackPixel(pixel)

    if (x < left) left = x
    if (x > right) right = x

    if (y < top) top = y
    if (y > bottom) bottom = y
  }

  const position = { x: left, y: top }
  const size = { width: right - left + 1, height: bottom - top + 1 }
  return makeBounds(position, size)
}
