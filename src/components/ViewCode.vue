<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { ref, watch } from 'vue'
import { toCode as frameToCode } from '~/frame'
import { itemToCode, type Item } from '~/items/item'
import { type Frame } from '~/stores/editor'
import { highlight } from '~/utils/highlight'

const props = defineProps<{ source: Item[] | Item | Frame }>()
const codeHtml = ref('')

const updateCode = () => {
  let code = ''
  if (Array.isArray(props.source)) {
    code = props.source.map((v) => itemToCode(v, (name) => name)).join('\n')
  } else if (props.source.type === 'frame') {
    code = frameToCode(props.source, (name) => name)
  } else {
    code = itemToCode(props.source, (name) => name)
  }
  codeHtml.value = highlight(code)
}

// Immediate update when source type changes.
watch(
  () => ({
    isArray: Array.isArray(props.source),
    type: !Array.isArray(props.source) && props.source.type,
    id: !Array.isArray(props.source) && props.source.id,
  }),
  updateCode,
  { immediate: true },
)

// Debounced update for content changes.
watchDebounced(() => props.source, updateCode, { debounce: 300, deep: true })
</script>

<template>
  <pre class="code language-cpp"><code v-html="codeHtml"></code></pre>
</template>

<style scoped>
.code {
  padding: 0.5rem;
  max-height: 100%;
  overflow: auto;
  border-radius: 4px;
  background-color: var(--color-grid);
  /* Prsim sets different flex value which interferes with this layout. */
  flex: 1 !important;
}
</style>
