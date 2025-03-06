<script setup lang="ts">
import type { Point } from '~/types'
import { getInputId } from '~/utils/id'

defineProps<{ label: string }>()
const model = defineModel<Point>({ required: true })
const id = getInputId()

const updateX = (e: Event) => {
  const x = +(e.target as HTMLInputElement).value
  model.value = { x, y: model.value.y }
}

const updateY = (e: Event) => {
  const y = +(e.target as HTMLInputElement).value
  model.value = { x: model.value.x, y }
}
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div class="inputs">
      <div class="prefixed-input">
        x&nbsp;<input type="number" :value="model.x" @change="updateX" />
      </div>
      <div class="prefixed-input">
        y&nbsp;<input type="number" :value="model.y" @change="updateY" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.inputs {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
}

input {
  width: 100%;
}

.prefixed-input {
  display: flex;
}
</style>
