import { useFonts } from '~/stores/fonts'
import type { Bounds, Color, Point } from '~/types'
import { getRectBounds } from '~/utils/bounds'
import { drawPixel } from '~/utils/pixels'

export interface Text {
  type: 'text'
  id: number
  content: string
  font: string
  color: Color
  bounds: Bounds
  position: Point
}

const getBit = (buffer: Uint8Array, byteIndex: number, bitIndex: number) =>
  (buffer[byteIndex] & (1 << bitIndex)) === 0 ? 0 : 1

export const drawText = (ctx: CanvasRenderingContext2D, text: Text) => {
  const fonts = useFonts()
  const font = fonts.fonts.get(text.font)
  if (!font) return

  let offsetX = text.position.x
  let offsetY = text.position.y
  for (const char of text.content) {
    if (char === '\n') {
      offsetX = text.position.x
      offsetY += font.yAdvance
      continue
    }

    const glyphIndex = char.charCodeAt(0) - font.asciiStart
    const glyph = font.glyphs[glyphIndex]
    if (!glyph) continue

    for (let y = 0; y < glyph.height; y++) {
      for (let x = 0; x < glyph.width; x++) {
        const i = y * glyph.width + x
        const byteIndex = Math.floor(i / 8)
        const bitIndex = 7 - (i % 8)
        const bit = getBit(font.bytes, glyph.byteOffset + byteIndex, bitIndex)

        if (bit) {
          const canvasX = offsetX + x + glyph.deltaX
          const canvasY = offsetY + y + font.baseline + glyph.deltaY
          drawPixel(ctx, canvasX, canvasY, text.color)
        }
      }
    }

    offsetX += glyph.xAdvance
  }
}

export const getTextBounds = (text: Omit<Text, 'id' | 'bounds'>) => {
  const fonts = useFonts()
  const font = fonts.fonts.get(text.font)
  if (!font) return getRectBounds({ position: { x: 0, y: 0 }, size: { width: 0, height: 0 }}) // prettier-ignore

  let offsetX = 0
  let offsetY = 0
  let width = 0
  for (const char of text.content) {
    if (char === '\n') {
      offsetX = 0
      offsetY += font.yAdvance
      continue
    }

    const glyphIndex = char.charCodeAt(0) - font.asciiStart
    const glyph = font.glyphs[glyphIndex]
    if (!glyph) continue

    offsetX += glyph.xAdvance
    width = Math.max(width, offsetX)
  }

  return getRectBounds({
    position: text.position,
    size: { width, height: offsetY + font.yAdvance },
  })
}
