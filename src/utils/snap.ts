import type { Bounds, Point } from '~/types'

export type Snap = {
  amount: Point
  guides: {
    horizontal?: { from: Point; to: Point }
    vertical?: { from: Point; to: Point }
  }
}

export const getBoundsSnap = (
  bounds: Bounds,
  snapTargets: Bounds[],
  threshold: number,
): Snap => {
  const { left, right, top, bottom, center } = bounds
  const snap: Snap = { amount: { x: 0, y: 0 }, guides: {} }

  let minDistanceX = threshold
  let minDistanceY = threshold

  for (const target of snapTargets) {
    // Horizontal
    for (const x of [left, center.x, right]) {
      for (const targetX of [target.left, target.center.x, target.right]) {
        const dist = Math.abs(x - targetX)
        if (dist < minDistanceX) {
          minDistanceX = dist
          snap.amount.x = Math.floor(targetX - x)
          const edges = [top, bottom, target.top, target.bottom]
          snap.guides.horizontal = {
            from: { x: targetX, y: Math.min(...edges) },
            to: { x: targetX, y: Math.max(...edges) },
          }
        }
      }
    }
    // Vertical
    for (const y of [top, center.y, bottom]) {
      for (const targetY of [target.top, target.center.y, target.bottom]) {
        const dist = Math.abs(y - targetY)
        if (dist < minDistanceY) {
          minDistanceY = dist
          snap.amount.y = Math.floor(targetY - y)
          const edges = [left, right, target.left, target.right]
          snap.guides.vertical = {
            from: { x: Math.min(...edges), y: targetY },
            to: { x: Math.max(...edges), y: targetY },
          }
        }
      }
    }
  }
  return snap
}

export const getPointSnap = (
  point: Point,
  snapTargets: Bounds[],
  threshold: number,
) => {
  const snap: Snap = { amount: { x: 0, y: 0 }, guides: {} }
  let minDistanceX = threshold
  let minDistanceY = threshold

  for (const bounds of snapTargets) {
    // Horizontal
    for (const x of [bounds.left, bounds.center.x, bounds.right]) {
      const dist = Math.abs(point.x - x)
      if (dist < minDistanceX) {
        minDistanceX = dist
        snap.amount.x = Math.floor(x - point.x)
        const edges = [point.y, bounds.top, bounds.bottom]
        snap.guides.horizontal = {
          from: { x, y: Math.min(...edges) },
          to: { x, y: Math.max(...edges) },
        }
      }
    }
    // Vertical
    for (const y of [bounds.top, bounds.center.y, bounds.bottom]) {
      const dist = Math.abs(point.y - y)
      if (dist < minDistanceY) {
        minDistanceY = dist
        snap.amount.y = Math.floor(y - point.y)
        const edges = [point.x, bounds.left, bounds.right]
        snap.guides.vertical = {
          from: { x: Math.min(...edges), y },
          to: { x: Math.max(...edges), y },
        }
      }
    }
  }

  return snap
}
