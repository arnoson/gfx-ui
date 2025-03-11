import { toRef } from 'vue'
import { getRectBounds, type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import { useFrames } from '~/stores/frames'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useRect = defineTool(
  'rect',
  () => {
    const frames = useFrames()
    const editor = useEditor()

    let item: Rect | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = (point: Point) => {
      item = frames.addItem({
        type: 'rect',
        position: point,
        size: { width: 0, height: 0 },
        color: 15,
        radius: 0,
        isFilled: false,
      })
      if (!item) return

      frames.focusItem(item.id)
      startPoint = point
      isDragging = true
    }

    const onMouseMove = (point: Point) => {
      if (!isDragging) return
      if (!item) return

      const left = Math.min(startPoint.x, point.x)
      const top = Math.min(startPoint.y, point.y)
      const right = Math.max(startPoint.x, point.x)
      const bottom = Math.max(startPoint.y, point.y)
      item.position = { x: left, y: top }
      item.size = { width: right - left, height: bottom - top }
      item.bounds = getRectBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.activeToolId = 'select'
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
