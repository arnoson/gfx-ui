<script setup lang="ts">
import type { Line } from '~/items/line'
import type { Point } from '~/types'
import { getLineBounds } from '~/utils/bounds'
import ColorField from './ColorField.vue'
import PointField from './PointField.vue'

const props = defineProps<{ item: Line }>()

const updateFrom = (point: Point) => {
  props.item.from = point
  props.item.bounds = getLineBounds(props.item)
}

const updateTo = (point: Point) => {
  props.item.to = point
  props.item.bounds = getLineBounds(props.item)
}
</script>

<template>
  <div class="flow">
    <h2>Line Properties</h2>
    <ColorField v-model="item.color" label="Color" />
    <PointField
      :model-value="item.from"
      @update:model-value="updateFrom"
      label="From"
    />
    <PointField
      :model-value="item.to"
      @update:model-value="updateTo"
      label="To"
    />
  </div>
</template>
