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

import type { Bounds, Color, Point } from '~/types'
import { drawPixel } from '~/utils/pixels'
import { drawLine, drawVerticalLine } from './line'
import { makeBounds } from '~/utils/bounds'

export interface Circle {
  type: 'circle'
  id: number
  bounds: Bounds
  color: Color
  center: Point
  radius: number
  isFilled: boolean
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L357
const strokeCircle = (
  ctx: CanvasRenderingContext2D,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id' | 'bounds'>,
) => {
  const { x: x0, y: y0 } = center

  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r

  drawPixel(ctx, x0, y0 + r, color)
  drawPixel(ctx, x0, y0 - r, color)
  drawPixel(ctx, x0 + r, y0, color)
  drawPixel(ctx, x0 - r, y0, color)

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x

    drawPixel(ctx, x0 + x, y0 + y, color)
    drawPixel(ctx, x0 - x, y0 + y, color)
    drawPixel(ctx, x0 + x, y0 - y, color)
    drawPixel(ctx, x0 - x, y0 - y, color)
    drawPixel(ctx, x0 + y, y0 + x, color)
    drawPixel(ctx, x0 - y, y0 + x, color)
    drawPixel(ctx, x0 + y, y0 - x, color)
    drawPixel(ctx, x0 - y, y0 - x, color)
  }
}

const fillCircle = (
  ctx: CanvasRenderingContext2D,
  { center, radius: r, color }: Omit<Circle, 'type' | 'id'>,
) => {
  const { x: x0, y: y0 } = center
  const from = { x: x0, y: y0 - r }
  const to = { x: from.x, y: from.y + 2 * r }
  drawLine(ctx, { from, to, color })
  fillCircleHelper(ctx, x0, y0, r, 3, 0, color)
}

export const fillCircleHelper = (
  ctx: CanvasRenderingContext2D,
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
  ctx: CanvasRenderingContext2D,
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
      drawPixel(ctx, x0 + x, y0 + y, color)
      drawPixel(ctx, x0 + y, y0 + x, color)
    }
    if (cornerName & 0x2) {
      drawPixel(ctx, x0 + x, y0 - y, color)
      drawPixel(ctx, x0 + y, y0 - x, color)
    }
    if (cornerName & 0x8) {
      drawPixel(ctx, x0 - y, y0 + x, color)
      drawPixel(ctx, x0 - x, y0 + y, color)
    }
    if (cornerName & 0x1) {
      drawPixel(ctx, x0 - y, y0 - x, color)
      drawPixel(ctx, x0 - x, y0 - y, color)
    }
  }
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Omit<Circle, 'type' | 'id'>,
) => {
  if (circle.isFilled) fillCircle(ctx, circle)
  else strokeCircle(ctx, circle)
}

export const translateCircle = (circle: Circle, delta: Point) => {
  circle.center.x += delta.x
  circle.center.y += delta.y
}

export const moveCircle = (circle: Circle, position: Point) => {
  circle.center.x = position.x + circle.radius
  circle.center.y = position.y + circle.radius
}

export const getCircleBounds = (circle: {
  radius: number
  center: Point
}): Bounds => {
  const { center, radius } = circle
  const position = {
    x: center.x - radius,
    y: center.y - radius,
  }
  const size = { width: radius * 2 + 1, height: radius * 2 + 1 }
  return makeBounds(position, size)
}
