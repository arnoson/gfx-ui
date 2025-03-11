<script setup lang="ts">
import { type Rect } from '~/items/rect'
import type { Point, Size } from '~/types'
import CheckboxField from './CheckboxField.vue'
import ColorField from './ColorField.vue'
import NumberField from './NumberField.vue'
import PointField from './PointField.vue'
import SizeField from './SizeField.vue'
import { getMovedBounds } from '~/utils/bounds'
import { getItemBounds } from '~/items/item'

const props = defineProps<{ item: Rect }>()

const updatePosition = (point: Point) => {
  props.item.position = point
  props.item.bounds = getMovedBounds(props.item.bounds, point)
}

const updateSize = (size: Size) => {
  props.item.size = size
  props.item.bounds = getItemBounds(props.item)
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
    <NumberField v-model="item.radius" label="Radius" />
    <CheckboxField v-model="item.isFilled" label="Fill" />
  </div>
</template>
