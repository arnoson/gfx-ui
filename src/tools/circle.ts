import { type Circle } from '~/items/circle'
import { getItemBounds } from '~/items/item'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { useMagicKeys } from '@vueuse/core'
import { clonePoint } from '~/utils/point'
import { useProject } from '~/stores/project'
import { useHistory } from '~/stores/history'

export const useCircle = defineTool(
  'circle',
  () => {
    const editor = useEditor()
    const project = useProject()
    const history = useHistory()
    const { ctrl: snapDisabled } = useMagicKeys()
    let mode: 'drag' | 'idle' = 'idle'

    let item: Circle | undefined
    let startPoint = { x: 0, y: 0 }

    const startDrag = (point: Point) => {
      if (!snapDisabled.value) point = editor.snapPoint(point)

      item = project.addItem({
        type: 'circle',
        center: clonePoint(point),
        radius: 0,
        color: 15,
        isFilled: false,
      })
      if (!item) return

      editor.focusItem(item)
      startPoint = point
      mode = 'drag'
    }

    const drag = (point: Point) => {
      if (!item) return

      editor.resetSnapGuides()
      if (!snapDisabled.value) point = editor.snapPoint(point, [item])

      const distanceX = point.x - startPoint.x
      const distanceY = point.y - startPoint.y
      const diameter = Math.max(Math.abs(distanceX), Math.abs(distanceY))
      const radius = Math.max(1, Math.floor(diameter / 2))

      // The circles size can only be odd (2 * radius + 1).
      if (distanceX % 2 === 0) editor.resetSnapGuides('horizontal')
      if (distanceY % 2 === 0) editor.resetSnapGuides('vertical')

      const x =
        distanceX > 0 ? startPoint.x + radius : startPoint.x - radius - 1
      const y =
        distanceY > 0 ? startPoint.y + radius : startPoint.y - radius - 1

      item.center = { x, y }
      item.radius = radius
      item.bounds = getItemBounds(item)
    }

    const endDrag = () => {
      editor.activateTool('select')
      editor.resetSnapGuides()
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
  { pointRounding: 'floor', shortcut: 'o' },
)
