<script setup lang="ts">
import { getInputId } from '~/utils/id'

defineProps<{ label: string; min?: number; max?: number; step?: number }>()
const model = defineModel<number>({ required: true })
const id = getInputId()
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input :id :min :max :step type="number" v-model="model" />
  </div>
</template>
