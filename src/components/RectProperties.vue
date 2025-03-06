<script setup lang="ts">
import type { Rect } from '~/items/rect'
import type { Point, Size } from '~/types'
import { getRectBounds } from '~/utils/bounds'
import ColorField from './ColorField.vue'
import PointField from './PointField.vue'
import CheckboxField from './CheckboxField.vue'
import SizeField from './SizeField.vue'

const props = defineProps<{ item: Rect }>()

const updatePosition = (point: Point) => {
  props.item.position = point
  props.item.bounds = getRectBounds(props.item)
}

const updateSize = (size: Size) => {
  props.item.size = size
  props.item.bounds = getRectBounds(props.item)
}
</script>

<template>
  <div class="flow">
    <h2>Rect Properties</h2>
    <ColorField v-model="item.color" label="Color" />
    <PointField
      :model-value="item.position"
      @update:model-value="updatePosition"
      label="Position"
    />
    <SizeField
      :model-value="item.size"
      @update:model-value="updateSize"
      label="Size"
    />
    <CheckboxField v-model="item.isFilled" label="Fill" />
  </div>
</template>
