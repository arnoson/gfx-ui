<script setup lang="ts">
import { translateBitmap, type Bitmap } from '~/items/bitmap'
import type { Point } from '~/types'
import { getBitmapBounds } from '~/utils/bounds'
import ColorField from './ColorField.vue'
import PointField from './PointField.vue'

const props = defineProps<{ item: Bitmap }>()

const updatePosition = (point: Point) => {
  const delta = {
    x: point.x - props.item.bounds.left,
    y: point.y - props.item.bounds.top,
  }
  console.log(delta)
  translateBitmap(props.item, delta)
  props.item.bounds = getBitmapBounds(props.item)
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
