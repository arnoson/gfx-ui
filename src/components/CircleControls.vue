<script setup lang="ts">
import { toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import circle, { type Circle } from '~/items/circle'

const props = defineProps<{ item: Circle }>()

const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = circle.getBounds(props.item))

const topLeftHandle = useTemplateRef('topLeftHandle')
useSvgDraggable(topLeftHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const distanceX = Math.max(2, bounds.value.right - x)
    const distanceY = Math.max(2, bounds.value.bottom - y)
    const distance = Math.max(distanceX, distanceY)
    const radius = Math.round(distance / 2)

    props.item.center.x = bounds.value.right - radius
    props.item.center.y = bounds.value.bottom - radius
    props.item.radius = radius
    updateBounds()
  },
})

const topRightHandle = useTemplateRef('topRightHandle')
useSvgDraggable(topRightHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const distanceX = Math.max(2, x - bounds.value.left)
    const distanceY = Math.max(2, bounds.value.bottom - y)
    const distance = Math.max(distanceX, distanceY)
    const radius = Math.round(distance / 2)

    props.item.center.x = bounds.value.left + radius
    props.item.center.y = bounds.value.bottom - radius
    props.item.radius = radius
    updateBounds()
  },
})

const bottomLeftHandle = useTemplateRef('bottomLeftHandle')
useSvgDraggable(bottomLeftHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const distanceX = Math.max(2, bounds.value.right - x)
    const distanceY = Math.max(2, y - bounds.value.top)
    const distance = Math.max(distanceX, distanceY)
    const radius = Math.round(distance / 2)

    props.item.center.x = bounds.value.right - radius
    props.item.center.y = bounds.value.top + radius
    props.item.radius = radius
    updateBounds()
  },
})

const bottomRightHandle = useTemplateRef('bottomRightHandle')
useSvgDraggable(bottomRightHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const distanceX = Math.max(2, x - bounds.value.left)
    const distanceY = Math.max(2, y - bounds.value.top)
    const distance = Math.max(distanceX, distanceY)
    const radius = Math.round(distance / 2)

    props.item.center.x = bounds.value.left + radius
    props.item.center.y = bounds.value.top + radius
    props.item.radius = radius
    updateBounds()
  },
})
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <circle
      ref="topLeftHandle"
      :cx="bounds.topLeft.x"
      :cy="bounds.topLeft.y"
      class="point-handle"
    />
    <circle
      ref="topRightHandle"
      :cx="bounds.topRight.x + 1"
      :cy="bounds.topRight.y"
      class="point-handle"
    />
    <circle
      ref="bottomLeftHandle"
      :cx="bounds.bottomLeft.x"
      :cy="bounds.bottomLeft.y + 1"
      class="point-handle"
    />
    <circle
      ref="bottomRightHandle"
      :cx="bounds.bottomRight.x + 1"
      :cy="bounds.bottomRight.y + 1"
      class="point-handle"
    />
  </g>
</template>
