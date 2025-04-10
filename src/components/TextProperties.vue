<script setup lang="ts">
import { type Text } from '~/items/text'
import ColorField from './ColorField.vue'
import SelectField from './SelectField.vue'
import { getItemBounds } from '~/items/item'
import { computed, nextTick, onMounted, useTemplateRef } from 'vue'
import { afterTextAdded } from '~/tools/text'
import { useFonts } from '~/stores/fonts'
import { useHistory } from '~/stores/history'

const props = defineProps<{ item: Text }>()
const fonts = useFonts()
const history = useHistory()

const fontOptions = computed(() =>
  [...fonts.fonts.values()].map((v) => ({ value: v.name, label: v.name })),
)

const updateContent = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  props.item.content = value
  props.item.bounds = getItemBounds(props.item)
  history.saveState()
}

const updateFont = (value: string) => {
  props.item.font = value
  props.item.bounds = getItemBounds(props.item)
  history.saveState()
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
      @update:model-value="history.saveState()"
      label="Color"
    />
    <SelectField
      :model-value="item.font"
      @update:model-value="updateFont"
      label="Font"
      :options="fontOptions"
    />
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
</template>

<style scoped>
textarea {
  width: 100%;
}
</style>
