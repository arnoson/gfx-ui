<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { type Circle } from '~/items/circle'
import { getItemBounds } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { getOppositeCorner } from '~/utils/bounds'
import { mouseToSvg } from '~/utils/mouse'
import { roundPoint } from '~/utils/point'

const props = defineProps<{ item: Circle }>()
const editor = useEditor()
const { ctrl: snapDisabled } = useMagicKeys()

let dragEl: SVGGraphicsElement | null = null
let startPoint = { x: 0, y: 0 }

const startDrag = (
  e: MouseEvent,
  corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
) => {
  e.stopPropagation()
  dragEl = e.target as SVGGraphicsElement

  const oppositeCorner = getOppositeCorner(corner)
  startPoint = props.item.bounds[oppositeCorner]

  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
}

const drag = (e: MouseEvent) => {
  if (!dragEl) return

  let point = roundPoint(mouseToSvg(e, dragEl))
  editor.resetSnapGuides()
  if (!snapDisabled.value) point = editor.snapPoint(point, [props.item])

  const distanceX = point.x - startPoint.x
  const distanceY = point.y - startPoint.y
  const diameter = Math.max(Math.abs(distanceX), Math.abs(distanceY))
  const radius = Math.max(1, Math.floor(diameter / 2))

  // The circles size can only be odd (2 * radius + 1).
  if (distanceX % 2 === 0) editor.resetSnapGuides('horizontal')
  if (distanceY % 2 === 0) editor.resetSnapGuides('vertical')

  const x = distanceX > 0 ? startPoint.x + radius : startPoint.x - radius - 1
  const y = distanceY > 0 ? startPoint.y + radius : startPoint.y - radius - 1

  props.item.center = { x, y }
  props.item.radius = radius
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
      :cx="item.bounds.topLeft.x"
      :cy="item.bounds.topLeft.y"
      @mousedown="startDrag($event, 'topLeft')"
    />
    <circle
      class="point-handle"
      :cx="item.bounds.topRight.x"
      :cy="item.bounds.topRight.y"
      @mousedown="startDrag($event, 'topRight')"
    />
    <circle
      class="point-handle"
      :cx="item.bounds.bottomRight.x"
      :cy="item.bounds.bottomRight.y"
      @mousedown="startDrag($event, 'bottomRight')"
    />
    <circle
      class="point-handle"
      :cx="item.bounds.bottomLeft.x"
      :cy="item.bounds.bottomLeft.y"
      @mousedown="startDrag($event, 'bottomLeft')"
    />
  </g>
</template>
