<script setup lang="ts">
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  dropTargetForExternal,
  monitorForExternal,
} from '@atlaskit/pragmatic-drag-and-drop/external/adapter'
import {
  containsFiles,
  getFiles,
} from '@atlaskit/pragmatic-drag-and-drop/external/file'
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled'
import {
  computed,
  onWatcherCleanup,
  ref,
  useTemplateRef,
  watchEffect,
} from 'vue'
import { ModalDialog } from 'vue-toolkit'
import IconSettings from '~/assets/icons/icon-add.svg'
import { useFonts } from '~/stores/fonts'
import type { GfxFont } from '~/utils/font'
import { getInputId } from '../utils/id'

type Option = { value: string; label: string }
type OptionGroup = { label: string; options: Option[] }

defineProps<{
  label: string
  allowEmpty?: boolean
}>()
const model = defineModel<string>({ required: true })
const id = getInputId()
const isOptionsGroup = (v: any): v is OptionGroup => !!v.options

const fonts = useFonts()
const customFontsDialog = useTemplateRef('customFontsDialog')
const options = computed<(Option | OptionGroup)[]>(() => {
  const toOption = (v: GfxFont) => ({ value: v.name, label: v.name })

  const hasCustom = !!fonts.customFonts.length
  if (!hasCustom) return fonts.builtInFonts.map(toOption)

  return [
    { label: 'Custom', options: fonts.customFonts.map(toOption) },
    { label: 'Built-in', options: fonts.builtInFonts.map(toOption) },
  ]
})

const dropState = ref<'idle' | 'over' | 'potential'>('idle')
const dropZone = useTemplateRef('dropZone')
const fileInput = useTemplateRef('fileInput')

const open = async (e: Event) => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  const code = await file.text()
  fonts.add(code)
}

watchEffect(() => {
  if (!dropZone.value) return

  const cleanup = combine(
    dropTargetForExternal({
      element: dropZone.value,
      canDrop: containsFiles,
      onDragEnter: () => {
        dropState.value = 'over'
      },
      onDragLeave: () => {
        dropState.value = 'potential'
      },
      onDrop: async (args) => {
        const [file] = getFiles(args)
        if (!file) return
        const code = await file.text()
        fonts.add(code)
      },
    }),

    monitorForExternal({
      canMonitor: containsFiles,
      onDragStart: () => {
        dropState.value = 'potential'
        preventUnhandled.start()
      },
      onDrop: () => {
        dropState.value = 'idle'
        preventUnhandled.stop()
      },
    }),
  )

  onWatcherCleanup(cleanup)
})
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div class="content">
      <select :id="id" v-model="model">
        <option v-if="allowEmpty" value="">–</option>
        <template v-for="option of options">
          <optgroup v-if="isOptionsGroup(option)" :label="option.label">
            <option v-for="{ value, label } of option.options" :value>
              {{ label }}
            </option>
          </optgroup>
          <option v-else :value="option.value">{{ option.label }}</option>
        </template>
      </select>
      <button @click="customFontsDialog?.open()" data-theme="dark">
        <IconSettings />
      </button>
    </div>
  </div>
  <ModalDialog ref="customFontsDialog">
    <div class="flow">
      <h2>Custom Fonts</h2>

      <div
        ref="dropZone"
        class="drop-zone"
        tabindex="0"
        :data-drop-state="dropState"
      >
        <input
          ref="fileInput"
          type="file"
          style="display: none"
          accept=".h,.hpp"
          @change="handleFileChange"
        />
        <button @click="open">Open</button>
        <div class="drop-hint">or drop file</div>
      </div>

      <ul v-if="fonts.customFonts" class="fonts-table">
        <li v-for="font in fonts.customFonts">
          <div class="font-name">{{ font.name }}</div>
          <button @click="fonts.remove(font.name)">Delete</button>
        </li>
      </ul>
    </div>
  </ModalDialog>
</template>

<style scoped>
.content {
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: var(--size-1);
}

.drop-zone {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  color: var(--color-gray-4);
  overflow: hidden;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;

  &[data-drop-state='over'] {
    color: var(--color-text);
    background-color: var(--color-accent);
    border-color: var(--color-accent);

    button {
      background-color: var(--color-text);
    }
  }

  &[data-drop-state='potential'] {
    border-color: var(--color-accent);
  }
}

.drop-hint {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fonts-table {
  list-style: none;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  li {
    display: grid;
    gap: 1ch;
    grid-template-columns: 1fr max-content;
    align-items: center;
  }

  .font-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
