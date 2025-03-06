<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import type { Rect } from '~/items/rect'
import type { Frame } from '~/stores/frames'
import { getRectBounds } from '~/utils/bounds'
import { useFrames } from '~/stores/frames'

const props = defineProps<{ frame: Frame; item: Rect }>()

const frames = useFrames()

const focus = () => frames.focusItem(props.item.id)
const isFocused = computed(() => frames.focusedItemId === props.item.id)

const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = getRectBounds(props.item))

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

const rectHandle = useTemplateRef('rectHandle')
useSvgDraggable(rectHandle, {
  onMove: ({ x, y }) => {
    props.item.position = { x, y }
    updateBounds()
  },
})
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <rect
      ref="rectHandle"
      class="rect-handle"
      :x="item.bounds.left"
      :y="item.bounds.top"
      :width="item.bounds.width"
      :height="item.bounds.height"
      :fill="item.isFilled ? 'transparent' : 'none'"
      @mousedown="focus()"
    />
    <template v-if="isFocused">
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
    </template>
  </g>
</template>

<style scoped>
.rect-handle {
  stroke: transparent;
  stroke-width: 3;
  cursor: move;
}
</style>
