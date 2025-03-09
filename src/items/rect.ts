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

import type { Bounds, Color, Point, Size } from '~/types'
import { pixelColors } from '~/utils/pixels'
import { drawCircleHelper, fillCircleHelper } from './circle'
import { drawHorizontalLine, drawLine, drawVerticalLine } from './line'
import { makeBounds } from '~/utils/bounds'

export interface Rect {
  type: 'rect'
  id: number
  bounds: Bounds
  radius: number
  position: Point
  size: Size
  color: Color
  isFilled: boolean
}

export const drawRect = (ctx: CanvasRenderingContext2D, rect: Rect) => {
  if (rect.radius) drawRoundRect(ctx, rect)
  else drawNormalRect(ctx, rect)
}

const drawNormalRect = (
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

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  { color, radius, size, position, isFilled }: Rect,
) => {
  const { width: w, height: h } = size
  let r = radius ?? 0
  const { x, y } = position

  const max_radius = (w < h ? w : h) / 2
  if (r > max_radius) r = max_radius

  if (isFilled) {
    drawNormalRect(ctx, {
      position: { x: x + r, y },
      size: { width: w - 2 * r, height: h },
      color,
      radius,
      isFilled,
    })
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

export const translateRect = (rect: Rect, delta: Point) => {
  rect.position.x += delta.x
  rect.position.y += delta.y
}

export const moveRect = (rect: Rect, position: Point) => {
  rect.position = position
}

export const getRectBounds = (rect: Omit<Rect, 'id' | 'bounds'>) =>
  makeBounds(rect.position, rect.size)
