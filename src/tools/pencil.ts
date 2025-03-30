import { computed } from 'vue'
import { getItemBounds } from '~/items/item'
import { getLinePixels } from '~/items/line'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { defineTool } from './tool'
import { useProject } from '~/stores/project'

export const usePencil = defineTool(
  'pencil',
  () => {
    const editor = useEditor()
    const project = useProject()

    let isDrawing = false
    let lastPoint: Point | null = null

    const item = computed(() => {
      if (!editor.focusedItem || editor.focusedItem.type !== 'bitmap') return
      return editor.focusedItem
    })

    const createItem = () => {
      const newItem = project.addItem({
        type: 'bitmap',
        pixels: new Set(),
        color: 15,
      })
      if (newItem) editor.focusItem(newItem)
    }

    const onMouseDown = (point: Point) => {
      if (!item.value) createItem()
      isDrawing = true
      lastPoint = point
    }

    const onMouseMove = (point: Point) => {
      if (!isDrawing) return
      if (!item.value) return

      const pixels = getLinePixels(lastPoint!, point)
      for (const pixel of pixels) item.value.pixels.add(pixel)
      item.value.bounds = getItemBounds(item.value)

      lastPoint = point
    }

    const onMouseUp = () => (isDrawing = false)

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor', shortcut: 'p' },
)
