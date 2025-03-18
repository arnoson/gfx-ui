<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { getPointSnap } from '~/utils/snap'

const props = defineProps<{ item: Rect }>()
const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = getItemBounds(props.item))
const editor = useEditor()

const snapTargets = computed(() => {
  const targets = editor.itemsFlat
    .filter((v) => v.type !== 'group' && v !== props.item)
    .map((v) => v.bounds!)
  targets.push(editor.frameBounds)
  return targets
})

const { ctrl } = useMagicKeys()
const snap = (point: Point) => {
  if (ctrl.value) return point
  const threshold = editor.snapThreshold
  const { amount, guides } = getPointSnap(point, snapTargets.value, threshold)
  editor.snapGuides = guides
  return { x: point.x + amount.x, y: point.y + amount.y }
}

const handleMove = (
  point: { x: number; y: number },
  corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
) => {
  const { x, y } = snap(point)

  const isLeft = corner === 'topLeft' || corner === 'bottomLeft'
  const isTop = corner === 'topLeft' || corner === 'topRight'

  const oppositeX = isLeft ? bounds.value.right : bounds.value.left
  const oppositeY = isTop ? bounds.value.bottom : bounds.value.top

  const width = isLeft ? oppositeX - x : x - oppositeX
  const height = isTop ? oppositeY - y : y - oppositeY

  if (width > 1) {
    if (isLeft) props.item.position.x = x
    props.item.size.width = width
  }
  if (height > 1) {
    if (isTop) props.item.position.y = y
    props.item.size.height = height
  }

  updateBounds()
}

const topLeftHandle = useTemplateRef('topLeftHandle')
useSvgDraggable(topLeftHandle, {
  isPoint: true,
  onMove: (point) => handleMove(point, 'topLeft'),
  onEnd: () => (editor.snapGuides = null),
})

const topRightHandle = useTemplateRef('topRightHandle')
useSvgDraggable(topRightHandle, {
  isPoint: true,
  onMove: (point) => handleMove(point, 'topRight'),
  onEnd: () => (editor.snapGuides = null),
})

const bottomLeftHandle = useTemplateRef('bottomLeftHandle')
useSvgDraggable(bottomLeftHandle, {
  isPoint: true,
  onMove: (point) => handleMove(point, 'bottomLeft'),
  onEnd: () => (editor.snapGuides = null),
})

const bottomRightHandle = useTemplateRef('bottomRightHandle')
useSvgDraggable(bottomRightHandle, {
  isPoint: true,
  onMove: (point) => handleMove(point, 'bottomRight'),
  onEnd: () => (editor.snapGuides = null),
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
      :cx="item.bounds.topRight.x"
      :cy="item.bounds.topRight.y"
      class="point-handle"
    />
    <circle
      ref="bottomLeftHandle"
      :cx="item.bounds.bottomLeft.x"
      :cy="item.bounds.bottomLeft.y"
      class="point-handle"
    />
    <circle
      ref="bottomRightHandle"
      :cx="item.bounds.bottomRight.x"
      :cy="item.bounds.bottomRight.y"
      class="point-handle"
    />
  </g>
</template>
