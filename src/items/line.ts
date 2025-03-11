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

import type { Bounds, Color, Pixels, Point } from '~/types'
import { makeBounds } from '~/utils/bounds'
import { drawPixel, packPixel } from '~/utils/pixels'

export interface Line {
  type: 'line'
  id: number
  bounds: Bounds
  color: Color
  from: Point
  to: Point
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L132
export const getLinePixels = (from: Point, to: Point) => {
  const pixels: Pixels = new Set()

  let { x: x0, y: y0 } = from
  let { x: x1, y: y1 } = to

  const isSteep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (isSteep) {
    // Swap x0 with y0.
    let temp = x0
    x0 = y0
    y0 = temp
    // Swap x1 with y1.
    temp = x1
    x1 = y1
    y1 = temp
  }

  if (x0 > x1) {
    // Swap x0 with x1.
    let temp = x0
    x0 = x1
    x1 = temp
    // Swap y0 with y1.
    temp = y0
    y0 = y1
    y1 = temp
  }

  const dx = x1 - x0
  const dy = Math.abs(y1 - y0)

  let err = dx / 2
  let yStep

  if (y0 < y1) yStep = 1
  else yStep = -1

  for (; x0 <= x1; x0++) {
    if (isSteep) pixels.add(packPixel(y0, x0))
    else pixels.add(packPixel(x0, y0))

    err -= dy
    if (err < 0) {
      y0 += yStep
      err += dx
    }
  }

  return pixels
}

export const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  color: Color,
) => {
  const to = { x: x, y: y + height - 1 }
  draw(ctx, { from: { x, y }, to, color })
}

export const drawHorizontalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: Color,
) => {
  const to = { x: x + width, y }
  draw(ctx, { from: { x, y }, to, color })
}

// Based on https://github.com/adafruit/Adafruit-GFX-Library/blob/87e15509a9e16892e60947bc4231027882edbd34/Adafruit_GFX.cpp#L132
const draw = (
  ctx: CanvasRenderingContext2D,
  { from, to, color }: Omit<Line, 'type' | 'id' | 'bounds'>,
) => {
  let { x: x0, y: y0 } = from
  let { x: x1, y: y1 } = to

  const isSteep = Math.abs(y1 - y0) > Math.abs(x1 - x0)

  if (isSteep) {
    // Swap x0 with y0.
    let temp = x0
    x0 = y0
    y0 = temp
    // Swap x1 with y1.
    temp = x1
    x1 = y1
    y1 = temp
  }

  if (x0 > x1) {
    // Swap x0 with x1.
    let temp = x0
    x0 = x1
    x1 = temp
    // Swap y0 with y1.
    temp = y0
    y0 = y1
    y1 = temp
  }

  const dx = x1 - x0
  const dy = Math.abs(y1 - y0)

  let err = dx / 2
  let yStep

  if (y0 < y1) yStep = 1
  else yStep = -1

  for (; x0 <= x1; x0++) {
    if (isSteep) drawPixel(ctx, y0, x0, color)
    else drawPixel(ctx, x0, y0, color)

    err -= dy
    if (err < 0) {
      y0 += yStep
      err += dx
    }
  }
}

const translate = (line: Line, delta: Point) => {
  line.from.x += delta.x
  line.from.y += delta.y
  line.to.x += delta.x
  line.to.y += delta.y
}

const move = (line: Line, position: Point) => {
  const delta = {
    x: position.x - line.bounds.left,
    y: position.y - line.bounds.top,
  }
  translate(line, delta)
}

const getBounds = (line: Omit<Line, 'id' | 'bounds'>): Bounds => {
  const top = Math.min(line.from.y, line.to.y)
  const left = Math.min(line.from.x, line.to.x)
  const bottom = Math.max(line.from.y, line.to.y)
  const right = Math.max(line.from.x, line.to.x)
  const position = { x: left, y: top }
  const size = { width: right - left + 1, height: bottom - top + 1 }
  return makeBounds(position, size)
}

export default { draw, translate, move, getBounds }
