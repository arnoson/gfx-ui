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

import type { Bounds, CodeContext, Color, Point } from '~/types'
import { makeBounds } from '~/utils/bounds'
import { commentRegex, composeRegex, metaRegex } from '~/utils/regex'
import {
  parseItemSettings,
  serializeItemSettings,
  type DrawContext,
  type ItemActions,
} from './item'
import { drawVerticalLine } from './line'

export interface Circle {
  type: 'circle'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  bounds: Bounds
  color: Color
  center: Point
  radius: number
  isFilled: boolean
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L357
const strokeCircle = (
  ctx: DrawContext,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id' | 'bounds'>,
  offset: Point,
) => {
  const x0 = center.x + offset.x
  const y0 = center.y + offset.y

  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r

  ctx.drawPixel(x0, y0 + r, color)
  ctx.drawPixel(x0, y0 - r, color)
  ctx.drawPixel(x0 + r, y0, color)
  ctx.drawPixel(x0 - r, y0, color)

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x

    ctx.drawPixel(x0 + x, y0 + y, color)
    ctx.drawPixel(x0 - x, y0 + y, color)
    ctx.drawPixel(x0 + x, y0 - y, color)
    ctx.drawPixel(x0 - x, y0 - y, color)
    ctx.drawPixel(x0 + y, y0 + x, color)
    ctx.drawPixel(x0 - y, y0 + x, color)
    ctx.drawPixel(x0 + y, y0 - x, color)
    ctx.drawPixel(x0 - y, y0 - x, color)
  }
}

const fillCircle = (
  ctx: DrawContext,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id'>,
  offset: Point,
) => {
  const x0 = center.x + offset.x
  const y0 = center.y + offset.y
  drawVerticalLine(ctx, x0, y0 - r, 2 * r + 1, color)
  fillCircleHelper(ctx, x0, y0, r, 3, 0, color)
}

export const fillCircleHelper = (
  ctx: DrawContext,
  x0: number,
  y0: number,
  r: number,
  corners: number,
  delta: number,
  color: Color,
) => {
  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r
  let px = x
  let py = y

  delta++

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
      if (corners & 1)
        drawVerticalLine(ctx, x0 + x, y0 - y, 2 * y + delta, color)
      if (corners & 2)
        drawVerticalLine(ctx, x0 - x, y0 - y, 2 * y + delta, color)
    }
    if (y != py) {
      if (corners & 1)
        drawVerticalLine(ctx, x0 + py, y0 - px, 2 * px + delta, color)
      if (corners & 2)
        drawVerticalLine(ctx, x0 - py, y0 - px, 2 * px + delta, color)
      py = y
    }
    px = x
  }
}

export const drawCircleHelper = (
  ctx: DrawContext,
  x0: number,
  y0: number,
  r: number,
  cornerName: number,
  color: Color,
) => {
  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x
    if (cornerName & 0x4) {
      ctx.drawPixel(x0 + x, y0 + y, color)
      ctx.drawPixel(x0 + y, y0 + x, color)
    }
    if (cornerName & 0x2) {
      ctx.drawPixel(x0 + x, y0 - y, color)
      ctx.drawPixel(x0 + y, y0 - x, color)
    }
    if (cornerName & 0x8) {
      ctx.drawPixel(x0 - y, y0 + x, color)
      ctx.drawPixel(x0 - x, y0 + y, color)
    }
    if (cornerName & 0x1) {
      ctx.drawPixel(x0 - y, y0 - x, color)
      ctx.drawPixel(x0 - x, y0 - y, color)
    }
  }
}

const draw = (
  ctx: DrawContext,
  circle: Omit<Circle, 'type' | 'id'>,
  offset = { x: 0, y: 0 },
) => {
  if (circle.isFilled) fillCircle(ctx, circle, offset)
  else strokeCircle(ctx, circle, offset)
}

const translate = (circle: Circle, delta: Point) => {
  circle.center.x += delta.x
  circle.center.y += delta.y
}

const move = (circle: Circle, position: Point) => {
  circle.center.x = position.x + circle.radius
  circle.center.y = position.y + circle.radius
}

const getBounds = (circle: Pick<Circle, 'center' | 'radius'>): Bounds => {
  const { center, radius } = circle
  const position = {
    x: center.x - radius,
    y: center.y - radius,
  }
  const size = { width: radius * 2 + 1, height: radius * 2 + 1 }
  return makeBounds(position, size)
}

const toCode = (circle: Circle, ctx: CodeContext) => {
  const method = circle.isFilled ? 'fillCircle' : 'drawCircle'
  const { center, radius, color, name } = circle

  const x = ctx.includeOffset ? `x + ${center.x}` : center.x
  const y = ctx.includeOffset ? `y + ${center.y}` : center.y

  let code = `display.${method}(${x}, ${y}, ${radius}, ${color});`
  if (ctx.comments === 'names') {
    code += ` // ${ctx.getUniqueName(name)}`
  } else if (ctx.comments === 'all') {
    code += ` // ${ctx.getUniqueName(name)} ${serializeItemSettings(circle)}`
  }
  return code
}

const regex = composeRegex(
  /^display.(?<method>drawCircle|fillCircle)\((?<args>.+)\); /,
  commentRegex,
  metaRegex,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { method, args, name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  const [x, y, radius, color] = args.split(',').map((v) => +v.trim())
  let item = {
    type: 'circle',
    name,
    center: { x, y },
    radius,
    color,
    isFilled: method === 'fillCircle',
    isLocked,
    isHidden,
  } as const

  return { item, length }
}

export const circle: ItemActions<Circle> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
