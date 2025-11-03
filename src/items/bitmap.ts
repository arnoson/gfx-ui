import type { Bounds, CodeContext, Color, Pixels, Point } from '~/types'
import { getBit, setBit } from '~/utils/bit'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { sanitizeIdentifier } from '~/utils/identifier'
import { packPixel, unpackPixel } from '~/utils/pixels'
import { commentRegex, composeRegex, metaRegex } from '~/utils/regex'
import {
  parseItemArgs,
  parseItemSettings,
  serializeItemSettings,
  type DrawContext,
  type ItemActions,
} from './item'

export interface Bitmap {
  type: 'bitmap'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  bounds: Bounds
  pixels: Pixels
  color: Color
}

const draw = (
  ctx: DrawContext,
  { pixels, color }: Bitmap,
  offset = { x: 0, y: 0 },
) => {
  for (const pixel of pixels) {
    const { x, y } = unpackPixel(pixel)
    ctx.drawPixel(x + offset.x, y + offset.y, color)
  }
}

const translate = (bitmap: Bitmap, delta: Point) => {
  const translatedPixels: Pixels = new Set()
  for (const pixel of bitmap.pixels) {
    const { x, y } = unpackPixel(pixel)
    translatedPixels.add(packPixel(x + delta.x, y + delta.y))
  }
  bitmap.pixels = translatedPixels
}

const move = (bitmap: Bitmap, position: Point) => {
  const delta = {
    x: position.x - bitmap.bounds.left,
    y: position.y - bitmap.bounds.top,
  }
  translate(bitmap, delta)
}

const getBounds = (bitmap: Pick<Bitmap, 'pixels'>): Bounds => {
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

const toCode = (bitmap: Bitmap, ctx: CodeContext) => {
  const { bounds: bounds, pixels, color, name } = bitmap

  // Calculate bytes per row (each row must be byte-aligned)
  const bytesPerRow = Math.ceil(bounds.width / 8)
  const totalBytes = bytesPerRow * bounds.height
  const bytes = new Uint8Array(totalBytes)

  for (let y = 0; y < bounds.height; y++) {
    for (let x = 0; x < bounds.width; x++) {
      const pixel = packPixel(bounds.left + x, bounds.top + y)
      // We use a positive value to indicate a filled (white) pixel, but
      // GFX seems to do it the other way round.
      const value = !pixels.has(pixel)

      // Calculate byte and bit index within the row
      const byteIndex = y * bytesPerRow + Math.floor(x / 8)
      const bitIndex = 7 - (x % 8)

      setBit(bytes, byteIndex, bitIndex, value)
    }
  }

  const uniqueName = ctx.getUniqueName(name)
  const bytesIdentifier = sanitizeIdentifier(`${uniqueName}_bytes`)
  let code = `static const byte ${bytesIdentifier}[] PROGMEM = {\n`
  let bytesPerDisplayRow = 12
  for (let i = 0; i < bytes.length; i++) {
    if (i > 0 && i % bytesPerDisplayRow === 0) code += '\n'
    if (i % bytesPerDisplayRow === 0) code += '  '
    code += `0x${bytes[i].toString(16).padStart(2, '0')}, `
  }
  if (code.at(-1) !== '\n') code += '\n'
  code += '};\n'

  const x = ctx.includeOffset ? `x + ${bounds.x}` : bounds.x
  const y = ctx.includeOffset ? `y + ${bounds.y}` : bounds.y

  code += `display.drawBitmap(${x}, ${y}, ${bytesIdentifier}, ${bounds.width}, ${bounds.height}, ${color});`
  if (ctx.comments === 'names') {
    code += ` // ${uniqueName}`
  } else if (ctx.comments === 'all') {
    code += ` // ${uniqueName} ${serializeItemSettings(bitmap)}`
  }
  return code
}

const regex = composeRegex(
  /^(?:static)? const byte (\w+)_bytes\[\]\s+PROGMEM\s+=\s+{(?<bytesString>[^}]+)};\s*/,
  /display.drawBitmap\((?<args>.+)\); /,
  commentRegex,
  metaRegex,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { bytesString, args, name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  const bytes = new Uint8Array(bytesString.split(',').map((v) => +v))
  const [offsetX, offsetY, _, width, height, color] = parseItemArgs(args)

  // Calculate bytes per row (each row is byte-aligned)
  const bytesPerRow = Math.ceil(width / 8)

  const pixels: Pixels = new Set()
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate byte and bit index within the row
      const byteIndex = y * bytesPerRow + Math.floor(x / 8)
      const bitIndex = 7 - (x % 8)
      const bit = getBit(bytes, byteIndex, bitIndex)

      if (bit) {
        const pixel = packPixel(offsetX + x, offsetY + y)
        pixels.add(pixel)
      }
    }
  }

  const item = {
    type: 'bitmap',
    name: name || undefined,
    color,
    pixels,
    isHidden,
    isLocked,
  } as const

  return { item, length }
}

export const bitmap: ItemActions<Bitmap> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
