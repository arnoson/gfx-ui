<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { getMovedBounds } from '~/utils/bounds'

const props = defineProps<{ item: Line }>()
const { from, to } = toRefs(props.item)
const editor = useEditor()

const fromHandle = useTemplateRef('fromHandle')
useSvgDraggable(fromHandle, {
  isPoint: true,
  onMove(position) {
    from.value = position
    props.item.bounds = getItemBounds(props.item)
  },
})

const toHandle = useTemplateRef('toHandle')
useSvgDraggable(toHandle, {
  isPoint: true,
  onMove(position) {
    to.value = position
    props.item.bounds = getItemBounds(props.item)
  },
})

const lineHandle = useTemplateRef('lineHandle')
useSvgDraggable(lineHandle, {
  onMove({ x, y }) {
    const left = Math.min(from.value.x, to.value.x)
    const top = Math.min(from.value.y, to.value.y)
    const delta = { x: x - left, y: y - top }
    from.value.x += delta.x
    from.value.y += delta.y
    to.value.x += delta.x
    to.value.y += delta.y
    props.item.bounds = getMovedBounds(props.item.bounds, { x, y })
  },
})
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <line
      ref="lineHandle"
      class="line-handle"
      :x1="from.x + 0.5"
      :y1="from.y + 0.5"
      :x2="to.x + 0.5"
      :y2="to.y + 0.5"
      @mousedown="editor.focusedItem = item"
    />
    <template v-if="editor.focusedItem === item">
      <circle
        ref="fromHandle"
        :cx="from.x + 0.5"
        :cy="from.y + 0.5"
        class="point-handle"
      />
      <circle
        ref="toHandle"
        :cx="to.x + 0.5"
        :cy="to.y + 0.5"
        class="point-handle"
      />
    </template>
  </g>
</template>

<style scoped>
.line-handle {
  stroke: transparent;
  stroke-width: 4;
  cursor: move;
}
</style>
