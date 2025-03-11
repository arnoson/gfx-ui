import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useLine = defineTool(
  'line',
  () => {
    const editor = useEditor()

    let item: Line | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = ({ x, y }: Point) => {
      item = editor.addItem({
        type: 'line',
        from: { x, y },
        to: { x, y },
        color: 15,
      })
      if (!item) return

      editor.focusedItem = item
      startPoint = { x, y }
      isDragging = true
    }

    const onMouseMove = ({ x, y }: Point) => {
      if (!isDragging) return
      if (!item) return

      item.to = { x, y }
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
