// The drawing code is ported and slightly modified from the Adafruit GFX source code
// https://github.com/adafruit/Adafruit-GFX-Library

/*
This is the core graphics library for all our displays, providing a common
set of graphics primitives (points, lines, circles, etc.).  It needs to be
paired with a hardware-specific library for each display device we carry
(to handle the lower-level functions).

Adafruit invests time and resources providing this open source code, please
support Adafruit & open-source hardware by purchasing products from Adafruit!

Copyright (c) 2013 Adafruit Industries.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
 */

import type { Bounds, CodeContext, Color, Point, Size } from '~/types'
import { pixelColors } from '~/utils/pixels'
import { drawCircleHelper, fillCircleHelper } from './circle'
import { drawHorizontalLine, drawVerticalLine } from './line'
import { makeBounds } from '~/utils/bounds'
import {
  parseItemArgs,
  parseItemSettings,
  serializeItemSettings,
  type ItemActions,
} from './item'
import { commentRegex, composeRegex, metaRegex } from '~/utils/regex'

export interface Rect {
  type: 'rect'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  bounds: Bounds
  radius: number
  position: Point
  size: Size
  color: Color
  isFilled: boolean
}

const drawNormalRect = (
  ctx: CanvasRenderingContext2D,
  {
    position,
    size,
    color,
    isFilled,
  }: Pick<Rect, 'position' | 'size' | 'color' | 'isFilled'>,
  offset: Point,
) => {
  const { width, height } = size
  const left = position.x + offset.x
  const top = position.y + offset.y
  const right = offset.x + left + width - 1
  const bottom = offset.y + top + height - 1

  if (isFilled) {
    ctx.fillStyle = pixelColors[color]
    ctx.fillRect(left, top, width, height)
  } else {
    drawHorizontalLine(ctx, left, top, width - 1, color) // top
    drawHorizontalLine(ctx, left, bottom, width - 1, color) // bottom
    drawVerticalLine(ctx, left, top, height, color) // left
    drawVerticalLine(ctx, right, top, height, color) // right
  }
}

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  { color, radius, size, position, isFilled }: Rect,
  offset: Point,
) => {
  const { width: w, height: h } = size
  let r = radius ?? 0
  const x = position.x + offset.x
  const y = position.y + offset.y

  const max_radius = (w < h ? w : h) / 2
  if (r > max_radius) r = max_radius

  if (isFilled) {
    drawNormalRect(
      ctx,
      {
        position: { x: x + r, y },
        size: { width: w - 2 * r, height: h },
        color,
        isFilled,
      },
      offset,
    )
    fillCircleHelper(ctx, x + w - r - 1, y + r, r, 1, h - 2 * r - 1, color)
    fillCircleHelper(ctx, x + r, y + r, r, 2, h - 2 * r - 1, color)
  } else {
    drawHorizontalLine(ctx, x + r, y, w - 2 * r, color)
    drawHorizontalLine(ctx, x + r, y + h - 1, w - 2 * r, color)
    drawVerticalLine(ctx, x, y + r, h - 2 * r, color)
    drawVerticalLine(ctx, x + w - 1, y + r, h - 2 * r, color)

    drawCircleHelper(ctx, x + r, y + r, r, 1, color)
    drawCircleHelper(ctx, x + w - r - 1, y + r, r, 2, color)
    drawCircleHelper(ctx, x + w - r - 1, y + h - r - 1, r, 4, color)
    drawCircleHelper(ctx, x + r, y + h - r - 1, r, 8, color)
  }
}

const draw = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  offset = { x: 0, y: 0 },
) => {
  if (rect.radius) drawRoundRect(ctx, rect, offset)
  else drawNormalRect(ctx, rect, offset)
}

const translate = (rect: Rect, delta: Point) => {
  rect.position.x += delta.x
  rect.position.y += delta.y
}

const move = (rect: Rect, position: Point) => {
  rect.position = position
}

const getBounds = (rect: Pick<Rect, 'position' | 'size'>) =>
  makeBounds(rect.position, rect.size)

const toCode = (rect: Rect, ctx: CodeContext) => {
  const { name, size, position, isFilled, radius, color } = rect
  const uniqueName = ctx.getUniqueName(name)

  const x = ctx.includeOffset ? `x + ${position.x}` : position.x
  const y = ctx.includeOffset ? `y + ${position.y}` : position.y

  let code = ''
  if (radius) {
    const method = isFilled ? 'fillRoundRect' : 'drawRoundRect'
    code += `display.${method}(${x}, ${y}, ${size.width}, ${size.height}, ${radius}, ${color});`
  } else {
    const method = isFilled ? 'fillRect' : 'drawRect'
    code += `display.${method}(${x}, ${y}, ${size.width}, ${size.height}, ${color});`
  }

  if (ctx.comments === 'names') {
    code += ` // ${uniqueName} ${serializeItemSettings(rect)}`
  } else if (ctx.comments === 'all') {
    code += ` // ${uniqueName} ${serializeItemSettings(rect)}`
  }

  return code
}

const regex = composeRegex(
  /^display.(?<method>drawRect|fillRect|drawRoundRect|fillRoundRect)\((?<args>.+)\); /,
  commentRegex,
  metaRegex,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { method, args, name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  const isRounded = method === 'drawRoundRect' || method === 'fillRoundRect'
  const isFilled = method === 'fillRect' || method === 'fillRoundRect'
  let x: number, y: number, width: number, height: number, color: number
  let radius = 0

  if (isRounded) {
    ;[x, y, width, height, radius, color] = parseItemArgs(args)
  } else {
    ;[x, y, width, height, color] = parseItemArgs(args)
  }

  const item = {
    type: 'rect',
    name,
    position: { x, y },
    size: { width, height },
    radius,
    color,
    isFilled,
    isLocked,
    isHidden,
  } as const

  return { item, length }
}

export const rect: ItemActions<Rect> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
