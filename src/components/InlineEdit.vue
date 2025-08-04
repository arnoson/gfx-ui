<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'

const model = defineModel<string>({ required: true })
defineEmits<{ end: [] }>()
const isEditing = ref(false)
const input = useTemplateRef('input')

const startEdit = async () => {
  isEditing.value = true
  await nextTick()
  input.value?.focus()
}

const endEdit = (e: Event) => {
  isEditing.value = false
  model.value = (e.target as HTMLInputElement).value
}
</script>

<template>
  <input
    v-if="isEditing"
    ref="input"
    :value="model"
    @change="endEdit"
    @blur="endEdit"
    @keydown.delete.stop
  />
  <span v-else @dblclick="startEdit()">{{ model }}</span>
</template>

<style scoped>
input {
  padding: 0;
  background: none;
  color: inherit;
  text-align: inherit;
  width: 100%;
  field-sizing: content;
}
</style>
