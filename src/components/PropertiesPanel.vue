<script setup lang="ts">
import { computed } from 'vue'
import { useEditor } from '~/stores/editor'
import BitmapProperties from './BitmapProperties.vue'
import CircleProperties from './CircleProperties.vue'
import FrameProperties from './FrameProperties.vue'
import LineProperties from './LineProperties.vue'
import RectProperties from './RectProperties.vue'
import SelectionProperties from './SelectionProperties.vue'
import SwitchField from './SwitchField.vue'
import TextProperties from './TextProperties.vue'
import ViewCode from './ViewCode.vue'
import InstanceProperties from './InstanceProperties.vue'
import PolygonProperties from './PolygonProperties.vue'

const editor = useEditor()
const item = computed(() => editor.focusedItem ?? undefined)
const frame = computed(() => editor.activeFrame ?? undefined)

const title = computed(() => {
  if (item.value) return item.value.type
  if (editor.selectedItems.size) return `${editor.selectedItems.size} selected`
  if (frame.value) return frame.value.type
})

const source = computed(() => {
  if (item.value) return item.value
  if (editor.selectedItems.size) return [...editor.selectedItems]
  if (frame.value) return frame.value
})
</script>

<template>
  <div class="panel">
    <header>
      <h2 class="heading">{{ title }}</h2>
      <SwitchField label="View code" v-model="editor.viewCode" />
    </header>
    <ViewCode v-if="source && editor.viewCode" :source="source" />
    <template v-else-if="item">
      <BitmapProperties v-if="item.type === 'bitmap'" :item />
      <RectProperties v-else-if="item.type === 'rect'" :item />
      <CircleProperties v-else-if="item.type === 'circle'" :item />
      <PolygonProperties v-else-if="item.type === 'polygon'" :item />
      <LineProperties v-else-if="item.type === 'line'" :item />
      <TextProperties v-else-if="item.type === 'text'" :item />
      <InstanceProperties v-else-if="item.type === 'instance'" :item />
      <SelectionProperties
        v-else-if="item.type === 'group'"
        :items="item.children"
      />
    </template>
    <SelectionProperties
      v-else-if="editor.selectedItems.size"
      :items="Array.from(editor.selectedItems)"
    />
    <FrameProperties v-else-if="frame" :frame="frame" />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
}

header {
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
  align-items: baseline;
}

.heading {
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-transform: capitalize;
}
</style>
