<script setup lang="ts">
import {
  CheckboxField,
  ColorField,
  NumberField,
  PointField,
} from 'tool-toolkit'
import { type Circle } from '~/items/circle'
import { getItemBounds } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import type { Point } from '~/types'

const props = defineProps<{ item: Circle }>()
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
    <ColorField
      v-model="item.color"
      label="Color"
      :swatches="editor.colors"
      @update:model-value="history.saveStateDebounced()"
    />
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
      @update:model-value="history.saveStateDebounced()"
      label="Fill"
    />
  </div>
</template>
