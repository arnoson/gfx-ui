import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { computed } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { getPointSnap } from '~/utils/snap'

export const useLine = defineTool(
  'line',
  () => {
    const editor = useEditor()

    let item: Line | undefined
    let isDragging = false
    let startPoint = { x: 0, y: 0 }

    const snapTargets = computed(() => {
      const targets = editor.itemsFlat
        .filter((v) => v.type !== 'group' && v !== item)
        .map((v) => v.bounds!)
      targets.push(editor.frameBounds)
      return targets
    })

    const { ctrl } = useMagicKeys()
    const snap = (point: Point) => {
      if (ctrl.value) return point
      const threshold = editor.snapThreshold
      const { amount, guides } = getPointSnap(
        point,
        snapTargets.value,
        threshold,
      )
      editor.snapGuides = guides
      return { x: point.x + amount.x, y: point.y + amount.y }
    }

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

    const onMouseMove = (point: Point) => {
      if (!isDragging) return
      if (!item) return

      editor.snapGuides = null
      item.to = snap(point)
      item.bounds = getItemBounds(item)
    }

    const onMouseUp = () => {
      isDragging = false
      editor.snapGuides = null
      editor.activateTool('select')
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor' },
)
