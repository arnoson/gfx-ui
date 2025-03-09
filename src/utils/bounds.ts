import type { Bounds, Point, Size } from '~/types'

export const makeBounds = (position: Point, size: Size): Bounds => {
  const { x, y } = position
  const { width, height } = size
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

export const emptyBounds = makeBounds({ x: 0, y: 0 }, { width: 0, height: 0 })

export const getTranslatedBounds = (bounds: Bounds, delta: Point) => {
  const { topLeft, width, height } = bounds
  const position = { x: topLeft.x + delta.x, y: topLeft.y + delta.y }
  return makeBounds(position, { width, height })
}

export const getMovedBounds = (bounds: Bounds, position: Point) => {
  const { width, height } = bounds
  return makeBounds(position, { width, height })
}

export const boundsContainPoint = (bounds: Bounds, point: Point) =>
  point.x >= bounds.left &&
  point.x <= bounds.right &&
  point.y >= bounds.top &&
  point.y <= bounds.bottom
