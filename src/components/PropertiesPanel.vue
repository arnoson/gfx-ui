<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import { computed, ref, watch } from 'vue'
import {
  CheckboxField,
  CodeViewer,
  SelectField,
  SwitchField,
} from 'vue-toolkit'
import { toCode as frameToCode } from '~/frame'
import { drawItem, itemToCode, type DrawContext } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import type { Pixels } from '~/types'
import { createCodeContext } from '~/utils/codeContext'
import { packPixel } from '~/utils/pixels'
import BitmapProperties from './BitmapProperties.vue'
import CircleProperties from './CircleProperties.vue'
import FrameProperties from './FrameProperties.vue'
import InstanceProperties from './InstanceProperties.vue'
import LineProperties from './LineProperties.vue'
import PolygonProperties from './PolygonProperties.vue'
import RectProperties from './RectProperties.vue'
import SelectionProperties from './SelectionProperties.vue'
import TextProperties from './TextProperties.vue'

const editor = useEditor()
const project = useProject()
const history = useHistory()
const item = computed(() => {
  if (editor.focusedItem) return editor.focusedItem
  if (editor.selectedItems.size === 1) {
    const [first] = [...editor.selectedItems]
    return first
  }
})
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

const canRasterize = computed(() => {
  if (item.value) return item.value.type !== 'bitmap'
  if (!editor.selectedItems.size) return false
  for (const item of editor.selectedItems) {
    if (item.type !== 'bitmap') return true
  }
})

const rasterize = () => {
  const pixels: Pixels = new Set()
  const ctx: DrawContext = {
    drawPixel: (x, y) => pixels.add(packPixel(x, y)),
  }

  const items = [...editor.selectedItems]
  for (const item of items) {
    drawItem(ctx, item)
    project.removeItem(item)
  }

  const item = project.addItem({ type: 'bitmap', color: 15, pixels })
  if (item) editor.focusItem(item)
  history.saveState()
}

// Code
const code = ref('')
const ctx = computed(() => createCodeContext(project.codeSettings))
const commentsOptions = [
  { value: 'none', label: 'None' },
  { value: 'names', label: 'Names' },
  { value: 'all', label: 'All' },
]
const updateCode = () => (code.value = getCode())
const getCode = () => {
  if (!source.value) {
    return ''
  } else if (Array.isArray(source.value)) {
    return source.value.map((v) => itemToCode(v, ctx.value)).join('\n')
  } else if (source.value.type === 'frame') {
    return frameToCode(source.value, ctx.value)
  } else {
    return itemToCode(source.value, ctx.value)
  }
}
// Immediate update when source type changes.
watch(
  () => ({
    isArray: Array.isArray(source.value),
    type: !Array.isArray(source.value) && source.value?.type,
    id: !Array.isArray(source.value) && source.value?.id,
    comments: ctx.value,
  }),
  updateCode,
  { immediate: true },
)
// Debounced update for content changes.
watchDebounced(source, updateCode, { debounce: 100, deep: true })
</script>

<template>
  <div class="panel">
    <header>
      <h2 class="heading">{{ title }}</h2>
      <SwitchField label="View code" v-model="editor.viewCode" />
    </header>

    <CodeViewer
      v-if="source && editor.viewCode"
      :code
      :file-name="`${project.name}.h`"
      language="cpp"
      class="code-viewer"
    >
      <template #settings>
        <div class="flow">
          <h2>Code settings</h2>
          <SelectField
            v-model="project.codeSettings.comments"
            :options="commentsOptions"
            label="Comments"
          />
          <CheckboxField
            v-model="project.codeSettings.includeOffset"
            label="Offset"
          />
        </div>
      </template>
    </CodeViewer>

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
    <template v-if="canRasterize">
      <hr />
      <button @click="rasterize">Rasterize</button>
    </template>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--size-2);
}

header {
  display: flex;
  gap: var(--size-2);
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

.code-viewer {
  flex: 1;
  overflow: hidden;
}
</style>
