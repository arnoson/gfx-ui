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
import { useHistory } from '~/stores/history'

const props = defineProps<{ item: Rect }>()
const history = useHistory()

const updatePosition = (point: Point) => {
  props.item.position = point
  props.item.bounds = getMovedBounds(props.item.bounds, point)
  history.saveStateDebounced()
}

const updateSize = (size: Size) => {
  props.item.size = size
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}
</script>

<template>
  <div class="flow">
    <h2>Rect Properties</h2>
    <ColorField
      v-model="item.color"
      @update:model-value="history.saveStateDebounced()"
      label="Color"
    />
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
    <NumberField
      v-model="item.radius"
      @update:model-value="history.saveStateDebounced()"
      label="Radius"
    />
    <CheckboxField
      v-model="item.isFilled"
      @update:model-value="history.saveStateDebounced()"
      label="Fill"
    />
  </div>
</template>
