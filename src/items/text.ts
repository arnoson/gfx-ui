import { useFonts } from '~/stores/fonts'
import type { Bounds, CodeContext, Color, Point } from '~/types'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { composeRegex, metaRegex } from '~/utils/regex'
import {
  parseItemArgs,
  parseItemSettings,
  serializeItemSettings,
  type DrawContext,
  type ItemActions,
} from './item'

export interface Text {
  type: 'text'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  content: string
  font: string
  color: Color
  bounds: Bounds
  position: Point
}

const getBit = (buffer: Uint8Array, byteIndex: number, bitIndex: number) =>
  (buffer[byteIndex] & (1 << bitIndex)) === 0 ? 0 : 1

const draw = (ctx: DrawContext, text: Text, offset = { x: 0, y: 0 }) => {
  const fonts = useFonts()
  const font = fonts.fonts.get(text.font)
  if (!font) return

  let glyphX = text.position.x + offset.x
  let glyphY = text.position.y + offset.y
  for (const char of text.content) {
    if (char === '\n') {
      glyphX = text.position.x
      glyphY += font.yAdvance
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
          const canvasX = x + glyphX + glyph.deltaX
          const canvasY = y + glyphY + font.baseline + glyph.deltaY
          ctx.drawPixel(canvasX, canvasY, text.color)
        }
      }
    }

    glyphX += glyph.xAdvance
  }
}

const translate = (text: Text, delta: Point) => {
  text.position.x += delta.x
  text.position.y += delta.y
}

const move = (text: Text, position: Point) => {
  text.position = position
}

const getBounds = (text: Pick<Text, 'font' | 'content' | 'position'>) => {
  const fonts = useFonts()
  const font = fonts.fonts.get(text.font)
  if (!font) return emptyBounds

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

  return makeBounds(text.position, { width, height: offsetY + font.yAdvance })
}

const toCode = (text: Text, ctx: CodeContext) => {
  const { content, position, color, font } = text
  const uniqueName = ctx.getUniqueName(text.name)

  let code = ''

  if (ctx.comments === 'all') {
    code += `// text-start ${uniqueName} ${serializeItemSettings(text)}\n`
  }

  const x = ctx.includeOffset ? `x + ${position.x}` : position.x
  const y = ctx.includeOffset ? `y + ${position.y}` : position.y

  code += `display.setCursor(${x}, ${y});
display.setTextColor(${color});
display.setFont(&${font});
display.print(${JSON.stringify(content)});`

  if (ctx.comments === 'all') code += '\n// text-end'
  else if (ctx.comments === 'names') code += ` // ${uniqueName}`

  return code
}

const regex = composeRegex(
  /^\/\/ text-start */,
  metaRegex,
  /(?<commands>[\s\S]+?)/,
  /\/\/ text-end/,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { name, settings, commands } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  let x = 0
  let y = 0
  let color = 0
  let font = '' // TODO: handle default font
  let content = ''

  let commandMatch: RegExpMatchArray | null
  if ((commandMatch = commands.match(/display.setCursor\((?<args>.+)\);/))) {
    ;[x, y] = parseItemArgs(commandMatch.groups!.args)
  }
  if (
    (commandMatch = commands.match(/display.setTextColor\((?<color>.+)\);/))
  ) {
    color = Number(commandMatch.groups!.color)
  }
  if ((commandMatch = commands.match(/display.setFont\(&(?<font>.+)\);/))) {
    font = commandMatch.groups!.font
  }
  if ((commandMatch = commands.match(/display.print\("(?<content>.+)"\);/))) {
    content = commandMatch.groups!.content
  }

  const item = {
    type: 'text',
    name,
    position: { x, y },
    content,
    font,
    color,
    isLocked,
    isHidden,
  } as const

  return { item, length }
}

export const text: ItemActions<Text> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
