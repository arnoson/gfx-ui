<script setup lang="ts">
import { isTemplateExpression } from 'typescript'
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import type { Circle } from '~/items/circle'
import type { Frame } from '~/stores/frames'
import { useFrames } from '~/stores/frames'
import { getCircleBounds } from '~/utils/bounds'

const props = defineProps<{ frame: Frame; item: Circle }>()
const frames = useFrames()

const focus = () => frames.focusItem(props.item.id)
const isFocused = computed(() => frames.focusedItemId === props.item.id)

const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = getCircleBounds(props.item))

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

const rectHandle = useTemplateRef('circleHandle')
useSvgDraggable(rectHandle, {
  onMove: ({ x, y }) => {
    props.item.center.x = x + props.item.radius
    props.item.center.y = y + props.item.radius
    updateBounds()
  },
})
</script>

<template>
  <circle
    ref="circleHandle"
    class="circle-handle"
    :cx="bounds.left + bounds.width / 2 + 0.5"
    :cy="bounds.top + bounds.height / 2 + 0.5"
    :r="bounds.width / 2"
    :fill="item.isFilled ? 'transparent' : 'none'"
    @mousedown="focus()"
  />
  <template v-if="isFocused">
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
  </template>
</template>

<style scoped>
.circle-handle {
  stroke: transparent;
  stroke-width: 3;
  cursor: move;
}
</style>
