<script setup lang="ts">
import { type Text } from '~/items/text'
import ColorField from './ColorField.vue'
import { getItemBounds } from '~/items/item'

const props = defineProps<{ item: Text }>()

const updateContent = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  props.item.content = value
  props.item.bounds = getItemBounds(props.item)
}
</script>

<template>
  <div class="flow">
    <h2>Text Properties</h2>
    <ColorField v-model="item.color" label="Color" />
    <div class="flow">
      <label>Content</label>
      <textarea
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
