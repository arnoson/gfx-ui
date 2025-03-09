<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import type { Text } from '~/items/text'
import { useFrames } from '~/stores/frames'
import { getMovedBounds } from '~/utils/bounds'

const props = defineProps<{ item: Text }>()

const frames = useFrames()
const focus = () => frames.focusItem(props.item.id)

const rectHandle = useTemplateRef('textHandle')
useSvgDraggable(rectHandle, {
  onMove: ({ x, y }) => {
    props.item.position = { x, y }
    props.item.bounds = getMovedBounds(props.item.bounds, { x, y })
  },
})
</script>

<template>
  <rect
    ref="textHandle"
    class="text-handle"
    :x="item.bounds.left"
    :y="item.bounds.top"
    :width="item.bounds.width"
    :height="item.bounds.height"
    @mousedown="focus()"
  />
</template>

<style scoped>
.text-handle {
  fill: transparent;
  cursor: move;
}
</style>
