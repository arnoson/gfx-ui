<script setup lang="ts">
import { type Circle } from '~/items/circle'
import { getItemBounds } from '~/items/item'
import type { Point } from '~/types'
import CheckboxField from './CheckboxField.vue'
import ColorField from './ColorField.vue'
import NumberField from './NumberField.vue'
import PointField from './PointField.vue'
import { useHistory } from '~/stores/history'

const props = defineProps<{ item: Circle }>()
const history = useHistory()

const updateCenter = (point: Point) => {
  props.item.center = point
  props.item.bounds = getItemBounds(props.item)
  history.saveState()
}

const updateRadius = (radius: number) => {
  props.item.radius = radius
  props.item.bounds = getItemBounds(props.item)
  history.saveState()
}
</script>

<template>
  <div class="flow">
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
    <CheckboxField
      v-model="item.isFilled"
      @update:model-value="history.saveState()"
      label="Fill"
    />
  </div>
</template>
