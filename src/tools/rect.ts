import { toRef } from 'vue'
import { useEditor } from '~/stores/editor'
import { useFrames } from '~/stores/frames'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { makeBounds } from '~/utils/bounds'
import type { Rect } from '~/items/rect'

export const useRect = defineTool(
  'rect',
  () => {
    const frames = useFrames()
    const editor = useEditor()
    const frame = toRef(frames.activeFrame)

    let item: Rect | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = (point: Point) => {
      if (!frame.value) return

      item = frames.addItem(frame.value.id, {
        type: 'rect',
        position: point,
        size: { width: 0, height: 0 },
        color: 15,
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
      item.bounds = makeBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.activeToolId = 'select'
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
