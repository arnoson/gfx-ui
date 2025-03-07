import { toRef } from 'vue'
import { useEditor } from '~/stores/editor'
import { useFrames } from '~/stores/frames'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { getCircleBounds } from '~/utils/bounds'
import type { Circle } from '~/items/circle'

export const useCircle = defineTool(
  'circle',
  () => {
    const frames = useFrames()
    const editor = useEditor()
    const frame = toRef(frames.activeFrame)

    let item: Circle | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = ({ x, y }: Point) => {
      if (!frame.value) return

      item = frames.addItem(frame.value.id, {
        type: 'circle',
        center: { x, y },
        radius: 0,
        color: 15,
        isFilled: false,
      })
      if (!item) return

      frames.focusItem(item.id)
      startPoint = { x, y }
      isDragging = true
    }

    const onMouseMove = (point: Point) => {
      if (!isDragging) return
      if (!item) return

      const distanceX = point.x - startPoint.x
      const distanceY = point.y - startPoint.y
      item.radius = Math.round(Math.hypot(distanceX, distanceY))
      item.bounds = getCircleBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.activeToolId = 'select'
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
