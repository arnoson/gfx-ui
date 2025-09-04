import { useMagicKeys } from '@vueuse/core'
import icon from '~/assets/icons/icon-line.svg'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import type { Point } from '~/types'
import { defineTool } from './tool'

export const useLine = defineTool('line', {
  icon,
  shortcut: 'l',
  pointRounding: 'round',
  setup: () => {
    const editor = useEditor()
    const project = useProject()
    const history = useHistory()
    const { ctrl: snapDisabled } = useMagicKeys()
    let mode: 'drag' | 'idle' = 'idle'

    let item: Line | undefined
    let startPoint = { x: 0, y: 0 }

    const startDrag = ({ x, y }: Point) => {
      item = project.addItem({
        type: 'line',
        from: { x, y },
        to: { x, y },
        color: 15,
      })
      if (!item) return

      editor.focusedItem = item
      startPoint = { x, y }
      mode = 'drag'
    }

    const drag = (point: Point) => {
      if (!item) return

      editor.resetSnapGuides()
      if (!snapDisabled.value) point = editor.snapPoint(point, [item])

      if (point.y > item.from.y) point.y -= 1
      if (point.x > item.from.x) point.x -= 1

      item.to = point
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
})
