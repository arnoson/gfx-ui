<script setup lang="ts">
import { toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getBitmapBounds, type Bitmap } from '~/items/bitmap'
import type { Frame } from '~/stores/frames'
import { useFrames } from '~/stores/frames'
import type { Pixels } from '~/types'
import { getMovedBounds } from '~/utils/bounds'
import { packPixel, unpackPixel } from '~/utils/pixels'

const props = defineProps<{ frame: Frame; item: Bitmap }>()
const { bounds } = toRefs(props.item)
const frames = useFrames()

const focus = () => frames.focusItem(props.item.id)

const bitmapHandle = useTemplateRef('bitmapHandle')
useSvgDraggable(bitmapHandle, {
  onMove: (point) => {
    const deltaX = point.x - bounds.value.left
    const deltaY = point.y - bounds.value.top

    const translatedPixels: Pixels = new Set()
    for (const pixel of props.item.pixels) {
      const { x, y } = unpackPixel(pixel)
      translatedPixels.add(packPixel(x + deltaX, y + deltaY))
    }
    props.item.pixels = translatedPixels
    props.item.bounds = getMovedBounds(props.item.bounds, point)
  },
})
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <rect
      ref="bitmapHandle"
      class="bitmap-handle"
      :x="bounds.topLeft.x"
      :y="bounds.topLeft.y"
      :width="bounds.width"
      :height="bounds.height"
      @mousedown="focus"
    />
  </g>
</template>

<style scoped>
.bitmap-handle {
  fill: transparent;
  cursor: move;
}
</style>
