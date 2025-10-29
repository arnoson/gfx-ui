<script setup lang="ts">
import {
  CheckboxField,
  ColorField,
  NumberField,
  PointField,
  SizeField,
} from 'tool-toolkit'
import { getItemBounds } from '~/items/item'
import { type Rect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import type { Point, Size } from '~/types'
import { getMovedBounds } from '~/utils/bounds'

const props = defineProps<{ item: Rect }>()
const editor = useEditor()
const history = useHistory()

const updatePosition = ({ x, y }: Point) => {
  props.item.position = { x, y }
  props.item.bounds = getMovedBounds(props.item.bounds, { x, y })
  history.saveStateDebounced()
}

const updateSize = ({ width, height }: Size) => {
  props.item.size = { width, height }
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}
</script>

<template>
  <div class="flow">
    <h2>Rect Properties</h2>
    <ColorField
      v-model="item.color"
      :swatches="editor.colors"
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
