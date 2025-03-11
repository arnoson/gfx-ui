import { type Circle } from '~/items/circle'
import { getItemBounds } from '~/items/item'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useCircle = defineTool(
  'circle',
  () => {
    const editor = useEditor()

    let item: Circle | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = ({ x, y }: Point) => {
      item = editor.addItem({
        type: 'circle',
        center: { x, y },
        radius: 0,
        color: 15,
        isFilled: false,
      })
      if (!item) return

      editor.focusedItem = item
      startPoint = { x, y }
      isDragging = true
    }

    const onMouseMove = (point: Point) => {
      if (!isDragging) return
      if (!item) return

      const distanceX = point.x - startPoint.x
      const distanceY = point.y - startPoint.y
      item.radius = Math.round(Math.hypot(distanceX, distanceY))
      item.bounds = getItemBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.activateTool('select')
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
