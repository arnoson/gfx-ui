<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { toCode as frameToCode, type Frame } from '~/frame'
import { itemToCode, type Item } from '~/items/item'
import { useProject } from '~/stores/project'
import { createCodeContext } from '~/utils/codeContext'
import { highlight } from '~/utils/highlight'
import SelectField from './SelectField.vue'
import { downloadFile } from '~/utils/file'
import ModalDialog from './ModalDialog.vue'
import CheckboxField from './CheckboxField.vue'
import IconSettings from '~/assets/icons/icon-settings.svg'

const props = defineProps<{ source: Item[] | Item | Frame }>()
const project = useProject()
const codeHtml = ref('')

const settingsDialog = useTemplateRef('settings')

const commentsOptions = [
  { value: 'none', label: 'None' },
  { value: 'names', label: 'Names' },
  { value: 'all', label: 'All' },
]

const ctx = computed(() => createCodeContext(project.codeSettings))

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
    <button style="margin-left: auto" @click="copy">copy</button>
    <button @click="download">download</button>
    <button @click="settingsDialog?.open()" class="settings-trigger">
      <IconSettings />
    </button>
  </div>
  <pre class="code language-cpp"><code v-html="codeHtml"></code></pre>
  <ModalDialog ref="settings" class="settings">
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
  </ModalDialog>
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
  margin: 0;

  ::v-deep(.token) {
    background: none;
  }
}

.menu {
  display: flex;
  gap: 0.5rem;

  button:has(svg) {
    padding-inline: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.settings-trigger {
  anchor-name: --code-settings-dialog-trigger;
}

.settings {
  position: absolute;
  position-anchor: --code-settings-dialog-trigger;
  top: anchor(top);
  left: anchor(left);
  translate: -100% 0;
  margin: -0.75rem -0.5rem;
  width: 40ch;
  padding: 0.75rem;
}
</style>
