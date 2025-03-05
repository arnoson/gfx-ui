import { computed, toRef } from 'vue'
import { getLinePixels } from '~/items/line'
import { useFrames } from '~/stores/frames'
import type { Point, ToolConfig } from '~/types'
import { defineTool } from './tool'
import { getBitmapBounds } from '~/utils/bounds'

const config: ToolConfig = { pointRounding: 'floor' }

export const useDraw = defineTool(
  'draw',
  () => {
    const frames = useFrames()
    const frame = toRef(frames.activeFrame)

    let isDrawing = false

    const item = computed(() => {
      const item = frames.focusedItem
      if (!item) return null
      if (item.type !== 'bitmap') return null
      return item
    })

    let lastPoint: Point | null = null

    const onMouseDown = (point: Point) => {
      isDrawing = true
      lastPoint = point
    }

    const onMouseMove = (point: Point) => {
      if (!isDrawing) return
      if (!item.value) return

      const pixels = getLinePixels(lastPoint!, point)
      for (const pixel of pixels) item.value.pixels.add(pixel)
      item.value.bounds = getBitmapBounds(item.value)

      lastPoint = point
    }

    const onMouseUp = () => (isDrawing = false)

    const activate = () => {
      if (!frame.value) return
      if (item.value) return

      const id = frames.addItem(frame.value.id, {
        type: 'bitmap',
        pixels: new Set(),
        color: 15,
      })

      if (id !== undefined) frames.focusItem(id)
    }

    return { onMouseDown, onMouseMove, onMouseUp, activate }
  },
  config,
)
