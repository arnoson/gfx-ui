<script setup lang="ts">
import { getInputId } from '~/utils/id'

defineProps<{ label: string }>()
const model = defineModel<number>({ required: true })
const id = getInputId()
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input :id="id" type="number" v-model="model" />
  </div>
</template>
