<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import type { Text } from '~/items/text'
import { useEditor } from '~/stores/editor'
import { getMovedBounds } from '~/utils/bounds'

const props = defineProps<{ item: Text }>()
const editor = useEditor()

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
    @mousedown="editor.focusedItem = item"
  />
</template>

<style scoped>
.text-handle {
  fill: transparent;
  cursor: move;
}
</style>
