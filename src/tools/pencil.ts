import { computed, toRaw } from 'vue'
import { getItemBounds, type DrawContext } from '~/items/item'
import { draw as drawLine } from '~/items/line'
import { useEditor } from '~/stores/editor'
import type { Pixels, Point } from '~/types'
import { defineTool } from './tool'
import { useProject } from '~/stores/project'
import { useHistory } from '~/stores/history'
import { packPixel } from '~/utils/pixels'

export const usePencil = defineTool(
  'pencil',
  () => {
    const editor = useEditor()
    const project = useProject()
    const history = useHistory()

    let isDrawing = false
    let lastPoint: Point | null = null
    let pixelsStart: Pixels | null = null

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
      pixelsStart = structuredClone(toRaw(item.value?.pixels)) ?? null
    }

    const onMouseMove = (point: Point) => {
      if (!isDrawing) return
      if (!item.value) return

      const ctx: DrawContext = {
        drawPixel: (x, y) => item.value?.pixels.add(packPixel(x, y)),
      }
      drawLine(ctx, { from: lastPoint!, to: point, color: 0 })

      item.value.bounds = getItemBounds(item.value)

      lastPoint = point
    }

    const onMouseUp = () => {
      if (item.value && editor.activeFrame) {
        const pixels = item.value.pixels
        const hasDrawn = pixelsStart && pixelsStart.size !== pixels.size
        if (hasDrawn) history.saveState()
      }
      pixelsStart = null
      isDrawing = false
    }

    return { onMouseDown, onMouseMove, onMouseUp }
  },
  { pointRounding: 'floor', shortcut: 'p' },
)
