<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { computed, toRefs, useTemplateRef } from 'vue'
import { useSvgDraggable } from '~/composables/useSvgDraggable'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import { getPointSnap } from '~/utils/snap'

const props = defineProps<{ item: Line }>()
const { from, to } = toRefs(props.item)
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

const fromHandle = useTemplateRef('fromHandle')
useSvgDraggable(fromHandle, {
  isPoint: true,
  onMove(point) {
    from.value = snap(point)
    props.item.bounds = getItemBounds(props.item)
  },
  onEnd: () => (editor.snapGuides = null),
})

const toHandle = useTemplateRef('toHandle')
useSvgDraggable(toHandle, {
  isPoint: true,
  onMove(point) {
    to.value = snap(point)
    props.item.bounds = getItemBounds(props.item)
  },
  onEnd: () => (editor.snapGuides = null),
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
