import type { Bounds, Pixels, Point, Size } from '~/types'
import { unpackPixel } from './pixels'
import type { Item, ItemData } from '~/stores/frames'

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

export const getItemBounds = (item: ItemData) => {
  if (item.type === 'line') return getLineBounds(item)
  if (item.type === 'rect') return getRectBounds(item)
  if (item.type === 'circle') return getCircleBounds(item)
  if (item.type === 'bitmap') return getBitmapBounds(item)
}
