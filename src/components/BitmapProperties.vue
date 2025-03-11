<script setup lang="ts">
import bitmap, { type Bitmap } from '~/items/bitmap'
import type { Point } from '~/types'
import { getMovedBounds } from '~/utils/bounds'
import ColorField from './ColorField.vue'
import PointField from './PointField.vue'

const props = defineProps<{ item: Bitmap }>()

const updatePosition = (point: Point) => {
  const delta = {
    x: point.x - props.item.bounds.left,
    y: point.y - props.item.bounds.top,
  }
  bitmap.translate(props.item, delta)
  props.item.bounds = getMovedBounds(props.item.bounds, point)
}
</script>

<template>
  <div class="flow">
    <h2>Bitmap Properties</h2>
    <ColorField v-model="item.color" label="Color" />
    <PointField
      :model-value="item.bounds.topLeft"
      @update:model-value="updatePosition"
      label="Position"
    />
  </div>
</template>
