<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { toCode as frameToCode } from '~/frame'
import { itemToCode, type Item } from '~/items/item'
import { type Frame } from '~/stores/editor'
import { useProject } from '~/stores/project'
import { createCodeContext } from '~/utils/codeContext'
import { highlight } from '~/utils/highlight'
import SelectField from './SelectField.vue'
import { downloadFile } from '~/utils/file'

const props = defineProps<{ source: Item[] | Item | Frame }>()
const project = useProject()
const codeHtml = ref('')

const commentsOptions = [
  { value: 'none', label: 'None' },
  { value: 'names', label: 'Names' },
  { value: 'all', label: 'All' },
]

const isSingleItem = computed(() =>
  Array.isArray(props.source)
    ? props.source.length === 1
    : props.source.type !== 'frame' && props.source.type !== 'group',
)

const ctx = computed(() =>
  createCodeContext({
    comments: isSingleItem.value
      ? project.singleItemComments
      : project.multipleItemsComments,
  }),
)

const updateCode = () => {
  codeHtml.value = highlight(getCode())
}

const getCode = () => {
  if (Array.isArray(props.source)) {
    return props.source.map((v) => itemToCode(v, ctx.value)).join('\n')
  } else if (props.source.type === 'frame') {
    return frameToCode(props.source, ctx.value)
  } else {
    return itemToCode(props.source, ctx.value)
  }
}

const copy = async () => await navigator.clipboard.writeText(getCode())

const download = () => {
  const name = Array.isArray(props.source)
    ? props.source.map((v) => v.name).join('-')
    : props.source.name
  downloadFile(`${name}.h`, getCode())
}

// Immediate update when source type changes.
watch(
  () => ({
    isArray: Array.isArray(props.source),
    type: !Array.isArray(props.source) && props.source.type,
    id: !Array.isArray(props.source) && props.source.id,
    comments: ctx.value,
  }),
  updateCode,
  { immediate: true },
)

// Debounced update for content changes.
watchDebounced(() => props.source, updateCode, { debounce: 100, deep: true })
</script>

<template>
  <div class="menu">
    <SelectField
      v-if="isSingleItem"
      v-model="project.singleItemComments"
      :options="commentsOptions"
      label="Comments"
    />
    <SelectField
      v-else
      v-model="project.multipleItemsComments"
      :options="commentsOptions"
      label="Comments"
    />
    <button style="margin-left: auto" @click="copy">copy</button>
    <button @click="download">download</button>
  </div>
  <pre class="code language-cpp"><code v-html="codeHtml"></code></pre>
</template>

<style scoped>
.code {
  padding: 0.5rem;
  max-height: max-content;
  overflow: auto;
  border-radius: 4px;
  background-color: var(--color-grid);
  /* Prsim sets different flex value which interferes with this layout. */
  flex: 1 !important;
}

.menu {
  display: flex;
  gap: 0.5rem;
}
</style>
