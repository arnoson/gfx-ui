<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { mouseToSvg } from '~/utils/mouse'
import { floorPoint } from '~/utils/point'

const props = defineProps<{ item: Line }>()
const editor = useEditor()
const { ctrl: snapDisabled } = useMagicKeys()

let dragEl: SVGGraphicsElement | null = null
let dragHandle: 'from' | 'to' = 'from'

const startDrag = (e: MouseEvent, handle: 'from' | 'to') => {
  e.stopPropagation()
  dragEl = e.target as SVGGraphicsElement
  dragHandle = handle
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
}

const drag = (e: MouseEvent) => {
  if (!dragEl) return

  let point = floorPoint(mouseToSvg(e, dragEl))
  editor.resetSnapGuides()
  if (!snapDisabled.value) point = editor.snapPoint(point, [props.item])

  const oppositeHandle = dragHandle === 'from' ? 'to' : 'from'
  if (point.y > props.item[oppositeHandle].y) point.y -= 1
  if (point.x > props.item[oppositeHandle].x) point.x -= 1

  props.item[dragHandle] = point
  props.item.bounds = getItemBounds(props.item)
}

const endDrag = () => {
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', endDrag)
  editor.resetSnapGuides()
}
</script>

<template>
  <g :data-item="`${item.type}@${item.id}`">
    <circle
      class="point-handle"
      :cx="item.from.x + 0.5"
      :cy="item.from.y + 0.5"
      @mousedown="startDrag($event, 'from')"
    />
    <circle
      class="point-handle"
      :cx="item.to.x + 0.5"
      :cy="item.to.y + 0.5"
      @mousedown="startDrag($event, 'to')"
    />
  </g>
</template>
