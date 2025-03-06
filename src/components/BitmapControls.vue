<script setup lang="ts">
import { toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import type { Bitmap } from '~/items/bitmap'
import type { Frame } from '~/stores/frames'
import { useFrames } from '~/stores/frames'
import type { Pixels } from '~/types'
import { getBitmapBounds } from '~/utils/bounds'
import { packPixel, unpackPixel } from '~/utils/pixels'

const props = defineProps<{ frame: Frame; item: Bitmap }>()
const frames = useFrames()

const focus = () => frames.focusItem(props.item.id)

const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = getBitmapBounds(props.item))

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
    updateBounds()
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
