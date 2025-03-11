import { computed, toRef } from 'vue'
import { getLinePixels } from '~/items/line'
import { useFrames } from '~/stores/frames'
import type { Point, ToolConfig } from '~/types'
import { defineTool } from './tool'
import { getBitmapBounds, type Bitmap } from '~/items/bitmap'

const config: ToolConfig = { pointRounding: 'floor' }

export const useDraw = defineTool(
  'draw',
  () => {
    const frames = useFrames()

    let isDrawing = false
    let item: Bitmap | undefined
    let lastPoint: Point | null = null

    const onMouseDown = (point: Point) => {
      isDrawing = true
      lastPoint = point
    }

    const onMouseMove = (point: Point) => {
      if (!isDrawing) return
      if (!item) return

      const pixels = getLinePixels(lastPoint!, point)
      for (const pixel of pixels) item.pixels.add(pixel)
      item.bounds = getBitmapBounds(item)

      lastPoint = point
    }

    const onMouseUp = () => (isDrawing = false)

    const activate = () => {
      if (item) return

      item = frames.addItem({
        type: 'bitmap',
        pixels: new Set(),
        color: 15,
      })

      if (item) frames.focusItem(item.id)
    }

    return { onMouseDown, onMouseMove, onMouseUp, activate }
  },
  config,
)
