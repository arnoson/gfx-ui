import { type Bitmap } from '~/items/bitmap'
import { getItemBounds } from '~/items/item'
import { getLinePixels } from '~/items/line'

import { useEditor } from '~/stores/editor'
import type { Point, ToolConfig } from '~/types'
import { defineTool } from './tool'

const config: ToolConfig = { pointRounding: 'floor' }

export const useDraw = defineTool(
  'draw',
  () => {
    const editor = useEditor()

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
      item.bounds = getItemBounds(item)

      lastPoint = point
    }

    const onMouseUp = () => (isDrawing = false)

    const activate = () => {
      if (item) return

      item = editor.addItem({
        type: 'bitmap',
        pixels: new Set(),
        color: 15,
      })

      if (item) editor.focusedItem = item
    }

    return { onMouseDown, onMouseMove, onMouseUp, activate }
  },
  config,
)
