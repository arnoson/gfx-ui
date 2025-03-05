import type { Bounds, Color, Pixels } from '~/types'
import { drawPixel, unpackPixel } from '~/utils/pixels'

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
