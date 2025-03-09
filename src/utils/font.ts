export type GfxGlyph = {
  width: number
  height: number
  deltaX: number
  deltaY: number
  xAdvance: number
  byteOffset: number
}

export type GfxFont = {
  name: string
  bytes: Uint8Array
  glyphs: GfxGlyph[]
  asciiStart: number
  asciiEnd: number
  yAdvance: number
  baseline: number
}

export const parseFont = (code: string): GfxFont => {
  const font = code.match(
    /GFXfont\s+(\w+)[\s\S]+(\s+[0-9a-zA-Z]+,\s+[0-9a-zA-Z]+,\s+[0-9a-zA-Z]+)/,
  )
  if (!font) throw new Error('No `GFXfont` found.')

  const [, name, characterInfo] = font
  const [asciiStart, asciiEnd, yAdvance] = characterInfo.split(',').map(Number)

  const bitmaps = code
    .match(/Bitmaps.*=\s+{([^}]+)/)?.[1]
    .split(',')
    .map(Number)

  if (!bitmaps) throw new Error('No bitmaps found.')
  const bytes = new Uint8Array(bitmaps)

  let baseline = 0
  // Look for groups of 6 numbers: `{ 0, 0, 0, 0, 0, 0}`.
  const glyphs = code.match(/{(\s*-?[a-zA-Z0-9]+\s*,?){6}}/g)?.map((v) => {
    const [byteOffset, width, height, xAdvance, deltaX, deltaY] = v
      .replace(/[{}]/g, '')
      .split(',')
      .map(Number)
    baseline = Math.max(baseline, deltaY * -1)
    return { byteOffset, width, height, xAdvance, deltaX, deltaY }
  })

  console.log({ baseline })

  if (!glyphs) throw new Error('No glyphs found.')

  return {
    name,
    bytes,
    glyphs,
    asciiStart,
    asciiEnd,
    yAdvance,
    baseline,
  }
}
