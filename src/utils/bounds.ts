import type { Bounds, Pixels, Point, Size } from '~/types'
import { unpackPixel } from './pixels'
import type { Item, ItemData } from '~/stores/frames'
import { moveLine, translateLine } from '~/items/line'
import { moveRect, translateRect } from '~/items/rect'
import { moveCircle, translateCircle } from '~/items/circle'
import { moveBitmap, translateBitmap } from '~/items/bitmap'
import { getTextBounds } from '~/items/text'

export const getRectBounds = (rect: {
  position: Point
  size: Size
}): Bounds => {
  const { x, y } = rect.position
  const { width, height } = rect.size
  const top = y
  const left = x
  const right = left + width - 1
  const bottom = y + height - 1

  return {
    x,
    y,
    top,
    left,
    right,
    bottom,
    width,
    height,
    topLeft: { x: left, y: top },
    topRight: { x: right, y: top },
    bottomLeft: { x: left, y: bottom },
    bottomRight: { x: right, y: bottom },
  }
}

export const getTranslatedBounds = (bounds: Bounds, delta: Point) => {
  const { topLeft, width, height } = bounds
  return getRectBounds({
    position: { x: topLeft.x + delta.x, y: topLeft.y + delta.y },
    size: { width, height },
  })
}

export const getMovedBounds = (bounds: Bounds, position: Point) => {
  const { width, height } = bounds
  return getRectBounds({ position, size: { width, height } })
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
  return getRectBounds({ position, size })
}

export const getLineBounds = (line: { from: Point; to: Point }): Bounds => {
  const top = Math.min(line.from.y, line.to.y)
  const left = Math.min(line.from.x, line.to.x)
  const bottom = Math.max(line.from.y, line.to.y)
  const right = Math.max(line.from.x, line.to.x)
  const position = { x: left, y: top }
  const size = { width: right - left + 1, height: bottom - top + 1 }
  return getRectBounds({ position, size })
}

export const getBitmapBounds = (bitmap: { pixels: Pixels }): Bounds => {
  if (!bitmap.pixels.size) {
    return getRectBounds({
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
    })
  }

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
  return getRectBounds({ position, size })
}

export const getItemBounds = (item: ItemData): Bounds => {
  if (item.type === 'line') return getLineBounds(item)
  if (item.type === 'rect') return getRectBounds(item)
  if (item.type === 'circle') return getCircleBounds(item)
  if (item.type === 'bitmap') return getBitmapBounds(item)
  if (item.type === 'text') return getTextBounds(item)
  return getRectBounds({
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
  })
}

export const boundsContainPoint = (bounds: Bounds, point: Point) =>
  point.x >= bounds.left &&
  point.x <= bounds.right &&
  point.y >= bounds.top &&
  point.y <= bounds.bottom

export const translateItem = (item: Item, delta: Point) => {
  if (item.type === 'line') translateLine(item, delta)
  if (item.type === 'rect') translateRect(item, delta)
  if (item.type === 'circle') translateCircle(item, delta)
  if (item.type === 'bitmap') translateBitmap(item, delta)
}

export const moveItem = (item: Item, position: Point) => {
  if (item.type === 'line') moveLine(item, position)
  if (item.type === 'rect') moveRect(item, position)
  if (item.type === 'circle') moveCircle(item, position)
  if (item.type === 'bitmap') moveBitmap(item, position)
}
