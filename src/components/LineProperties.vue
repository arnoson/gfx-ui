<script setup lang="ts">
import { ColorField, PointField } from 'vue-toolkit'
import { getItemBounds } from '~/items/item'
import { type Line } from '~/items/line'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import type { Point } from '~/types'

const props = defineProps<{ item: Line }>()
const editor = useEditor()
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
      :swatches="editor.colors"
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
