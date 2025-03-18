<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import circle, { type Circle } from '~/items/circle'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { getPointSnap } from '~/utils/snap'

const props = defineProps<{ item: Circle }>()
const { bounds } = toRefs(props.item)
const updateBounds = () => (props.item.bounds = circle.getBounds(props.item))
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

  // It just feels more natural if we decrease the distance by 2. This way the
  // mouse doesn't "lag" behind.
  const distanceX = Math.max(2, Math.abs(oppositeX - x) - 2)
  const distanceY = Math.max(2, Math.abs(oppositeY - y) - 2)
  const distance = Math.max(distanceX, distanceY)
  const radius = Math.round(distance / 2)

  // The circles size can only be odd (2 * radius + 1).
  if (distanceY % 2 === 0) editor.snapGuides!.vertical = undefined
  if (distanceX % 2 === 0) editor.snapGuides!.horizontal = undefined

  props.item.center.x = isLeft ? oppositeX - 1 - radius : oppositeX + radius
  props.item.center.y = isTop ? oppositeY - 1 - radius : oppositeY + radius
  props.item.radius = radius
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
      :cx="bounds.topLeft.x"
      :cy="bounds.topLeft.y"
      class="point-handle"
    />
    <circle
      ref="topRightHandle"
      :cx="bounds.topRight.x"
      :cy="bounds.topRight.y"
      class="point-handle"
    />
    <circle
      ref="bottomLeftHandle"
      :cx="bounds.bottomLeft.x"
      :cy="bounds.bottomLeft.y"
      class="point-handle"
    />
    <circle
      ref="bottomRightHandle"
      :cx="bounds.bottomRight.x"
      :cy="bounds.bottomRight.y"
      class="point-handle"
    />
  </g>
</template>
