<script setup lang="ts">
import { getItemBounds } from '~/items/item'
import type { Point } from '~/types'

import {
  CheckboxField,
  ColorField,
  NumberField,
  PointField,
  SelectField,
} from 'vue-toolkit'
import type { Polygon } from '~/items/polygon'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'

const props = defineProps<{ item: Polygon }>()
const editor = useEditor()
const history = useHistory()

const updateCenter = (point: Point) => {
  props.item.center = point
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}

const updateRadius = (radius: number) => {
  props.item.radius = radius
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}
</script>

<template>
  <div class="flow">
    <ColorField v-model="item.color" label="Color" :swatches="editor.colors" />
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
    <NumberField
      v-model="item.sides"
      :min="3"
      @update:model-value="history.saveStateDebounced()"
      label="Sides"
    />
    <SelectField
      v-model="item.rotation"
      :options="[
        { value: 0, label: '0°' },
        { value: Math.PI / 2, label: '90°' },
        { value: Math.PI, label: '180°' },
        { value: (3 * Math.PI) / 2, label: '270°' },
      ]"
      @update:model-value="history.saveStateDebounced()"
      label="Rotation"
    />
    <CheckboxField
      v-model="item.isFilled"
      @update:model-value="history.saveStateDebounced()"
      label="Fill"
    />
  </div>
</template>
