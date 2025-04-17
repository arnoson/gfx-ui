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
  parseItemArgs,
  parseItemSettings,
  serializeItemSettings,
  type DrawContext,
  type ItemActions,
} from './item'
import { drawHorizontalLine, draw as drawLine } from './line'

export interface Polygon {
  type: 'polygon'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  bounds: Bounds
  radius: number
  center: Point
  sides: number
  color: Color
  rotation: number
  isFilled: boolean
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/c450adbc04ca0b626993bf3b83aedbda655b8fca/Adafruit_GFX.cpp#L619
const fillTriangle = (
  ctx: DrawContext,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: Color,
) => {
  let a: number, b: number, y: number, last: number

  // Sort coordinates by Y order (y2 >= y1 >= y0)
  if (y0 > y1) {
    ;[y0, y1] = [y1, y0]
    ;[x0, x1] = [x1, x0]
  }
  if (y1 > y2) {
    ;[y1, y2] = [y2, y1]
    ;[x1, x2] = [x2, x1]
  }
  if (y0 > y1) {
    ;[y0, y1] = [y1, y0]
    ;[x0, x1] = [x1, x0]
  }

  if (y0 == y2) {
    // Handle awkward all-on-same-line case as its own thing
    a = b = x0
    if (x1 < a) a = x1
    else if (x1 > b) b = x1
    if (x2 < a) a = x2
    else if (x2 > b) b = x2

    drawHorizontalLine(ctx, a, y0, b - a + 1, color)
    return
  }

  const dx01 = x1 - x0
  const dy01 = y1 - y0
  const dx02 = x2 - x0
  const dy02 = y2 - y0
  const dx12 = x2 - x1
  const dy12 = y2 - y1
  let sa = 0
  let sb = 0

  // For upper part of triangle, find scanline crossings for segments
  // 0-1 and 0-2.  If y1=y2 (flat-bottomed triangle), the scanline y1
  // is included here (and second loop will be skipped, avoiding a /0
  // error there), otherwise scanline y1 is skipped here and handled
  // in the second loop...which also avoids a /0 error here if y0=y1
  // (flat-topped triangle).
  if (y1 == y2)
    last = y1 // Include y1 scanline
  else last = y1 - 1 // Skip it

  for (y = y0; y <= last; y++) {
    a = Math.round(x0 + sa / dy01)
    b = Math.round(x0 + sb / dy02)
    sa += dx01
    sb += dx02
    /* longhand:
    a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
    b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
    */
    if (a > b) [a, b] = [b, a]
    drawHorizontalLine(ctx, a, y, b - a + 1, color)
  }

  // For lower part of triangle, find scanline crossings for segments
  // 0-2 and 1-2.  This loop is skipped if y1=y2.
  sa = dx12 * (y - y1)
  sb = dx02 * (y - y0)
  for (; y <= y2; y++) {
    a = Math.round(x1 + sa / dy12)
    b = Math.round(x0 + sb / dy02)
    sa += dx12
    sb += dx02
    /* longhand:
    a = x1 + (x2 - x1) * (y - y1) / (y2 - y1);
    b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
    */
    if (a > b) [a, b] = [b, a]
    drawHorizontalLine(ctx, a, y, b - a + 1, color)
  }
}

export const getPolygonPoints = (polygon: Polygon) => {
  const { sides, radius, center, rotation } = polygon
  const points: Point[] = []
  const anglePerSide = (2 * Math.PI) / sides

  for (let i = 0; i < sides; i++) {
    const x = center.x + radius * Math.sin(rotation + i * anglePerSide)
    const y = center.y - radius * Math.cos(rotation + i * anglePerSide)
    points.push({ x: Math.floor(x), y: Math.floor(y) })
  }

  return points
}

const strokePolygon = (ctx: DrawContext, polygon: Polygon, offset: Point) => {
  const { sides, color } = polygon
  const points = getPolygonPoints(polygon)
  for (let i = 0; i < sides; i++) {
    const from = points[i]
    const to = points[(i + 1) % sides]
    drawLine(ctx, { from, to, color }, offset)
  }
}

const fillPolygon = (ctx: DrawContext, polygon: Polygon, offset: Point) => {
  const { sides, center, color } = polygon
  const points = getPolygonPoints(polygon)
  for (let i = 0; i < sides; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % sides]
    fillTriangle(
      ctx,
      center.x + offset.x,
      center.y + offset.y,
      p1.x,
      p1.y,
      p2.x,
      p2.y,
      color,
    )
  }
}

const draw = (ctx: DrawContext, rect: Polygon, offset = { x: 0, y: 0 }) => {
  if (rect.isFilled) fillPolygon(ctx, rect, offset)
  else strokePolygon(ctx, rect, offset)
}

const translate = (polygon: Polygon, delta: Point) => {
  polygon.center.x += delta.x
  polygon.center.y += delta.y
}

const move = (polygon: Polygon, position: Point) => {
  polygon.center.x = position.x + polygon.radius
  polygon.center.y = position.y + polygon.radius
}

const getBounds = (polygon: Pick<Polygon, 'center' | 'radius'>): Bounds => {
  const { center, radius } = polygon
  const position = {
    x: center.x - radius,
    y: center.y - radius,
  }
  const size = { width: radius * 2 + 1, height: radius * 2 + 1 }
  return makeBounds(position, size)
}

const toCode = (polygon: Polygon, ctx: CodeContext) => {
  const method = polygon.isFilled ? 'fillRegularPolygon' : 'drawRegularPolygon'
  const { center, radius, sides, rotation, color, name } = polygon

  const x = ctx.includeOffset ? `x + ${center.x}` : center.x
  const y = ctx.includeOffset ? `y + ${center.y}` : center.y

  let code = `gfxui::${method}(${x}, ${y}, ${sides}, ${radius}, ${rotation}, ${color});`
  if (ctx.comments === 'names') {
    code += ` // ${ctx.getUniqueName(name)}`
  } else if (ctx.comments === 'all') {
    code += ` // ${ctx.getUniqueName(name)} ${serializeItemSettings(polygon)}`
  }
  return code
}

const regex = composeRegex(
  /^gfxui::(?<method>drawRegularPolygon|fillRegularPolygon)\((?<args>.+)\); /,
  commentRegex,
  metaRegex,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null
  const { method, args, name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]
  const [x, y, sides, radius, rotation, color] = parseItemArgs(args)
  let item = {
    type: 'polygon',
    name,
    center: { x, y },
    sides,
    radius,
    rotation,
    color,
    isFilled: method === 'fillRegularPolygon',
    isLocked,
    isHidden,
  } as const
  return { item, length }
}

export const polygon: ItemActions<Polygon> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
