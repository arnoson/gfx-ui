import { getLineBounds, type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { useFrames } from '~/stores/frames'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useLine = defineTool(
  'line',
  () => {
    const frames = useFrames()
    const editor = useEditor()

    let item: Line | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const onMouseDown = ({ x, y }: Point) => {
      item = frames.addItem({
        type: 'line',
        from: { x, y },
        to: { x, y },
        color: 15,
      })
      if (!item) return

      frames.focusItem(item.id)
      startPoint = { x, y }
      isDragging = true
    }

    const onMouseMove = ({ x, y }: Point) => {
      if (!isDragging) return
      if (!item) return

      item.to = { x, y }
      item.bounds = getLineBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.activeToolId = 'select'
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
