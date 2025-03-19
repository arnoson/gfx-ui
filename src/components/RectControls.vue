<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import { getOppositeCorner } from '~/utils/bounds'
import { mouseToSvg } from '~/utils/mouse'
import { floorPoint } from '~/utils/point'

const props = defineProps<{ item: Rect }>()
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

  let point = floorPoint(mouseToSvg(e, dragEl))
  editor.resetSnapGuides()
  if (!snapDisabled.value) point = editor.snapPoint(point, [props.item])

  const distanceX = point.x - startPoint.x
  const distanceY = point.y - startPoint.y

  const width = Math.abs(distanceX)
  const height = Math.abs(distanceY)

  const x = distanceX > 0 ? startPoint.x : startPoint.x - width
  const y = distanceY > 0 ? startPoint.y : startPoint.y - height

  props.item.position = { x, y }
  props.item.size = { width, height }
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
