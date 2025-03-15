<script setup lang="ts">
import { toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'

const props = defineProps<{ item: Rect }>()
const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = getItemBounds(props.item))

const topLeftHandle = useTemplateRef('topLeftHandle')
useSvgDraggable(topLeftHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const width = bounds.value.right - x + 1
    const height = bounds.value.bottom - y + 1
    if (width > 1) {
      props.item.position.x = x
      props.item.size.width = width
    }
    if (height > 1) {
      props.item.position.y = y
      props.item.size.height = height
    }
    updateBounds()
  },
})

const topRightHandle = useTemplateRef('topRightHandle')
useSvgDraggable(topRightHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const width = x - bounds.value.left + 1
    const height = bounds.value.bottom - y + 1
    if (width > 1) {
      props.item.size.width = width
    }
    if (height > 1) {
      props.item.position.y = y
      props.item.size.height = height
    }
    updateBounds()
  },
})

const bottomLeftHandle = useTemplateRef('bottomLeftHandle')
useSvgDraggable(bottomLeftHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const width = bounds.value.right - x + 1
    const height = y - bounds.value.top + 1
    if (width > 1) {
      props.item.position.x = x
      props.item.size.width = width
    }
    if (height > 1) {
      props.item.size.height = height
    }
    updateBounds()
  },
})

const bottomRightHandle = useTemplateRef('bottomRightHandle')
useSvgDraggable(bottomRightHandle, {
  isPoint: true,
  onMove: ({ x, y }) => {
    const width = x - bounds.value.left + 1
    const height = y - bounds.value.top + 1
    if (width > 1) {
      props.item.size.width = width
    }
    if (height > 1) {
      props.item.size.height = height
    }
    updateBounds()
  },
})
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <circle
      ref="topLeftHandle"
      :cx="item.bounds.topLeft.x"
      :cy="item.bounds.topLeft.y"
      class="point-handle"
    />
    <circle
      ref="topRightHandle"
      :cx="item.bounds.topRight.x + 1"
      :cy="item.bounds.topRight.y"
      class="point-handle"
    />
    <circle
      ref="bottomLeftHandle"
      :cx="item.bounds.bottomLeft.x"
      :cy="item.bounds.bottomLeft.y + 1"
      class="point-handle"
    />
    <circle
      ref="bottomRightHandle"
      :cx="item.bounds.bottomRight.x + 1"
      :cy="item.bounds.bottomRight.y + 1"
      class="point-handle"
    />
  </g>
</template>
