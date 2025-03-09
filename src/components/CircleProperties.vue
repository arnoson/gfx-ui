<script setup lang="ts">
import { getCircleBounds, type Circle } from '~/items/circle'
import type { Point } from '~/types'
import CheckboxField from './CheckboxField.vue'
import ColorField from './ColorField.vue'
import NumberField from './NumberField.vue'
import PointField from './PointField.vue'

const props = defineProps<{ item: Circle }>()

const updateCenter = (point: Point) => {
  props.item.center = point
  props.item.bounds = getCircleBounds(props.item)
}

const updateRadius = (radius: number) => {
  props.item.radius = radius
  props.item.bounds = getCircleBounds(props.item)
}
</script>

<template>
  <div class="flow">
    <h2>Circle Properties</h2>
    <ColorField v-model="item.color" label="Color" />
    <PointField
      :model-value="item.center"
      @update:model-value="updateCenter"
      label="Center"
    />
    <NumberField
      :model-value="item.radius"
      @update:model-value="updateRadius"
      label="Radius"
    />
    <CheckboxField v-model="item.isFilled" label="Fill" />
  </div>
</template>
