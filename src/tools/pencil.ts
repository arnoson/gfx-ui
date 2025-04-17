import { computed, toRaw } from 'vue'
import { getItemBounds, type DrawContext } from '~/items/item'
import { draw as drawLine } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import type { Pixels, Point } from '~/types'
import { packPixel } from '~/utils/pixels'
import { defineTool } from './tool'
import { useDebounceFn } from '@vueuse/core'

export const usePencil = defineTool(
  'pencil',
  () => {
    const editor = useEditor()
    const project = useProject()
    const history = useHistory()

    let mode: 'draw' | 'erase' | 'idle' = 'idle'
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

    const pixelIsEmpty = (point: Point) =>
      !item.value?.pixels?.has(packPixel(point.x, point.y))

    // Prevent flickering when setting `isErasing` during mousemove (which
    // changes to pencil tool icon).
    const setIsErasingDebounced = useDebounceFn(
      (v: boolean) => (editor.isErasing = v),
      10,
    )

    const onMouseDown = (point: Point) => {
      if (!item.value) createItem()
      lastPoint = point
      pixelsStart = structuredClone(toRaw(item.value?.pixels)) ?? null
      mode = pixelIsEmpty(point) ? 'draw' : 'erase'
      editor.isErasing = mode === 'erase'
    }

    const onMouseMove = (point: Point) => {
      if (!item.value) return
      if (mode === 'idle') {
        setIsErasingDebounced(!pixelIsEmpty(point))
        return
      }

      const ctx: DrawContext = {
        drawPixel(x, y) {
          const pixel = packPixel(x, y)
          if (mode === 'draw') item.value?.pixels.add(pixel)
          else if (mode === 'erase') item.value?.pixels.delete(pixel)
        },
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
      editor.isErasing = false
      mode = 'idle'
    }

    const deactivate = () => (editor.isErasing = false)

    return { onMouseDown, onMouseMove, onMouseUp, deactivate }
  },
  { pointRounding: 'floor', shortcut: 'p' },
)
