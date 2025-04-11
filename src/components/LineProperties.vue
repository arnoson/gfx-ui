<script setup lang="ts">
import { type Line } from '~/items/line'
import type { Point } from '~/types'
import ColorField from './ColorField.vue'
import PointField from './PointField.vue'
import { getItemBounds } from '~/items/item'
import { useHistory } from '~/stores/history'

const props = defineProps<{ item: Line }>()
const history = useHistory()

const updateFrom = (point: Point) => {
  props.item.from = point
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}

const updateTo = (point: Point) => {
  props.item.to = point
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}
</script>

<template>
  <div class="flow">
    <ColorField
      v-model="item.color"
      @update:model-value="history.saveStateDebounced()"
      label="Color"
    />
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
