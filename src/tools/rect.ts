import { useMagicKeys } from '@vueuse/core'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { useProject } from '~/stores/project'
import { useHistory } from '~/stores/history'

export const useRect = defineTool(
  'rect',
  () => {
    const project = useProject()
    const editor = useEditor()
    const history = useHistory()
    const { ctrl: snapDisabled } = useMagicKeys()
    let mode: 'drag' | 'idle' = 'idle'

    let item: Rect | undefined
    let startPoint = { x: 0, y: 0 }

    const startDrag = (point: Point) => {
      if (!snapDisabled.value) point = editor.snapPoint(point)

      item = project.addItem({
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

      editor.resetSnapGuides()
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
      editor.resetSnapGuides()
      editor.activateTool('select')
      if (item) history.saveState()
      mode = 'idle'
    }

    const onMouseDown = startDrag
    const onMouseMove = (point: Point) => {
      if (mode === 'idle') {
        editor.resetSnapGuides()
        if (!snapDisabled.value) editor.snapPoint(point)
      } else {
        drag(point)
      }
    }
    const onMouseUp = endDrag

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor', shortcut: 'r' },
)
