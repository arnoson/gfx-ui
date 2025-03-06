import { translateBitmap } from '~/items/bitmap'
import { translateCircle } from '~/items/circle'
import { translateLine } from '~/items/line'
import { translateRect } from '~/items/rect'
import { useFrames } from '~/stores/frames'
import type { Point } from '~/types'
import {
  boundsContainPoint,
  getItemBounds,
  getLineBounds,
  getRectBounds,
} from '~/utils/bounds'
import { defineTool } from './tool'

export const useSelect = defineTool(
  'select',
  () => {
    const frames = useFrames()

    let mode: 'move' | 'select' | 'idle' = 'idle'

    let startPoint = { x: 0, y: 0 }
    let lastPoint = { x: 0, y: 0 }

    const startSelect = (point: Point) => {
      startPoint = point
      frames.blur()
      frames.selectionBounds = null
      frames.isSelecting = true
      frames.selectedItemIds.clear()
      mode = 'select'
    }

    const select = (point: Point) => {
      if (!frames.activeFrame) return

      // const left = Math.min(startPoint.x, point.x)
      // const right = Math.max(startPoint.x, point.x)
      // const top = Math.min(startPoint.y, point.y)
      // const bottom = Math.max(startPoint.y, point.y)

      // frames.selectionBounds = getRectBounds({
      //   position: { x: left, y: top },
      //   size: { width: right - left, height: bottom - top },
      // })

      frames.selectionBounds = getLineBounds({ from: startPoint, to: point })

      for (const { bounds, id } of frames.activeFrame.children) {
        const isIntersecting =
          bounds.left <= frames.selectionBounds.right &&
          bounds.right >= frames.selectionBounds.left &&
          bounds.top <= frames.selectionBounds.bottom &&
          bounds.bottom >= frames.selectionBounds.top
        if (isIntersecting) frames.selectedItemIds.add(id)
        else frames.selectedItemIds.delete(id)
      }
    }

    const endSelect = () => {
      if (!frames.selectedItems) {
        frames.selectionBounds = null
      } else if (frames.selectedItems.length === 1) {
        frames.focusItem(frames.selectedItems[0].id)
        frames.selectionBounds = null
      }
      frames.isSelecting = false
      mode = 'idle'
    }

    const startMove = (point: Point) => {
      lastPoint = point
      mode = 'move'
    }

    const move = (point: Point) => {
      if (!frames.selectedItems) return

      const delta = {
        x: point.x - lastPoint.x,
        y: point.y - lastPoint.y,
      }

      for (const item of frames.selectedItems) {
        if (item.type === 'group') continue

        if (item.type === 'rect') translateRect(item, delta)
        else if (item.type === 'circle') translateCircle(item, delta)
        else if (item.type === 'line') translateLine(item, delta)
        else if (item.type === 'bitmap') translateBitmap(item, delta)

        const bounds = getItemBounds(item)
        if (bounds) item.bounds = bounds
      }
      lastPoint = point
    }

    const endMove = () => (mode = 'idle')

    const onMouseDown = (point: Point) => {
      if (
        frames.selectedItemBounds &&
        boundsContainPoint(frames.selectedItemBounds, point)
      ) {
        startMove(point)
      } else {
        startSelect(point)
      }
    }

    const onMouseMove = (point: Point) => {
      if (mode === 'select') select(point)
      else if (mode === 'move') move(point)
    }

    const onMouseUp = () => {
      if (mode === 'select') endSelect()
      else if (mode === 'move') endMove()
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
