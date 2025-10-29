<script setup lang="ts">
import { ColorField, PointField } from 'tool-toolkit'
import { bitmap, type Bitmap } from '~/items/bitmap'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import type { Point } from '~/types'
import { getMovedBounds } from '~/utils/bounds'

const props = defineProps<{ item: Bitmap }>()
const editor = useEditor()
const history = useHistory()

const updatePosition = (point: Point) => {
  const delta = {
    x: point.x - props.item.bounds.left,
    y: point.y - props.item.bounds.top,
  }
  bitmap.translate(props.item, delta)
  props.item.bounds = getMovedBounds(props.item.bounds, point)
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
      :model-value="item.bounds.topLeft"
      @update:model-value="updatePosition"
      label="Position"
    />
  </div>
</template>
