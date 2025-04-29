<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { getItemBounds } from '~/items/item'
import { type Text } from '~/items/text'
import { useFonts } from '~/stores/fonts'
import { useHistory } from '~/stores/history'
import { afterTextAdded } from '~/tools/text'
import type { GfxFont } from '~/utils/font'
import ColorField from './ColorField.vue'
import FontUpload from './FontUpload.vue'
import SelectField from './SelectField.vue'
import { useEditor } from '~/stores/editor'
import ModalDialog from './ModalDialog.vue'
import IconSettings from '~/assets/icons/icon-settings.svg'

const props = defineProps<{ item: Text }>()
const editor = useEditor()
const fonts = useFonts()
const history = useHistory()

const customFontsDialog = useTemplateRef('customFontsDialog')

const fontOptions = computed(() => {
  const toOption = (v: GfxFont) => ({ value: v.name, label: v.name })

  const hasCustom = !!fonts.customFonts.length
  if (!hasCustom) return fonts.builtInFonts.map(toOption)

  return [
    { label: 'Custom', options: fonts.customFonts.map(toOption) },
    { label: 'Built-in', options: fonts.builtInFonts.map(toOption) },
  ]
})

const updateContent = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  props.item.content = value
  props.item.bounds = getItemBounds(props.item)
  history.saveStateDebounced()
}

const updateFont = (value: string) => {
  props.item.font = value
  props.item.bounds = getItemBounds(props.item)
  editor.currentFont = value
  history.saveStateDebounced()
}

const content = useTemplateRef('content')
afterTextAdded.on(() => {
  if (!content.value) return
  content.value.focus()
  content.value.select()
})
</script>

<template>
  <div class="flow">
    <h2>Text Properties</h2>
    <ColorField
      v-model="item.color"
      @update:model-value="history.saveStateDebounced()"
      label="Color"
    />
    <div>
      <SelectField
        :model-value="item.font"
        @update:model-value="updateFont"
        label="Font"
        :options="fontOptions"
      >
        <template #settings>
          <button @click="customFontsDialog?.open()">
            <IconSettings />
          </button>
        </template>
      </SelectField>
    </div>
    <div class="flow">
      <label>Content</label>
      <textarea
        ref="content"
        :value="item.content"
        @input="updateContent"
        rows="5"
      ></textarea>
    </div>
  </div>

  <ModalDialog ref="customFontsDialog">
    <div class="flow">
      <h2>Custom Fonts</h2>
      <FontUpload />
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
textarea {
  width: 100%;
}

button:has(svg) {
  padding-inline: 0.25rem;
  svg {
    display: block;
  }
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
