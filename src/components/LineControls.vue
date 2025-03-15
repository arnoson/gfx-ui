<script setup lang="ts">
import { toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'

const props = defineProps<{ item: Line }>()
const { from, to } = toRefs(props.item)

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
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
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
  </g>
</template>
