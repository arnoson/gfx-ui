import { useMagicKeys } from '@vueuse/core'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useRect = defineTool(
  'rect',
  () => {
    const editor = useEditor()
    const { ctrl: snapDisabled } = useMagicKeys()
    let mode: 'drag' | 'idle' = 'idle'

    let item: Rect | undefined
    let startPoint = { x: 0, y: 0 }

    const startDrag = (point: Point) => {
      if (!snapDisabled.value) point = editor.snapPoint(point)

      item = editor.addItem({
        type: 'rect',
        position: point,
        size: { width: 0, height: 0 },
        color: 15,
        radius: 0,
        isFilled: false,
      })
      if (!item) return

      editor.focusedItem = item
      startPoint = point
      mode = 'drag'
    }

    const drag = (point: Point) => {
      if (!item) return

      editor.snapGuides = null
      if (!snapDisabled.value) point = editor.snapPoint(point, [item])

      const left = Math.min(startPoint.x, point.x)
      const top = Math.min(startPoint.y, point.y)
      const right = Math.max(startPoint.x, point.x)
      const bottom = Math.max(startPoint.y, point.y)
      item.position = { x: left, y: top }
      item.size = { width: right - left, height: bottom - top }
      item.bounds = getItemBounds(item)
    }

    const endDrag = () => {
      editor.snapGuides = null
      editor.activateTool('select')
      mode = 'idle'
    }

    const onMouseDown = startDrag
    const onMouseMove = (point: Point) => {
      if (mode === 'idle') {
        editor.snapGuides = null
        if (!snapDisabled.value) editor.snapPoint(point)
      } else {
        drag(point)
      }
    }
    const onMouseUp = endDrag

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
