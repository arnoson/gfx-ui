<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { ColorField, TextAreaField } from 'vue-toolkit'
import { getItemBounds } from '~/items/item'
import { type Text } from '~/items/text'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { afterTextAdded } from '~/tools/text'
import FontField from './FontField.vue'

const props = defineProps<{ item: Text }>()
const editor = useEditor()
const history = useHistory()

const updateContent = (value: string) => {
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
  const textarea = content.value?.$el.querySelector('textarea')
  if (!textarea) return
  textarea.focus()
  textarea.select()
})
</script>

<template>
  <div class="flow">
    <h2>Text Properties</h2>
    <ColorField
      v-model="item.color"
      label="Color"
      :swatches="editor.colors"
      @update:model-value="history.saveStateDebounced()"
    />
    <FontField
      :model-value="item.font"
      @update:model-value="updateFont"
      label="Font"
    />
    <TextAreaField
      :model-value="item.content"
      @update:model-value="updateContent"
      ref="content"
      label="Content"
    />
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
}
</style>
