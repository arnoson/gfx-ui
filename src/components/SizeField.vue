<script setup lang="ts">
import type { Size } from '~/types'
import { getInputId } from '~/utils/id'

defineProps<{ label: string }>()
const model = defineModel<Size>({ required: true })
const id = getInputId()

const updateWidth = (e: Event) => {
  const width = +(e.target as HTMLInputElement).value
  model.value = { width, height: model.value.height }
}

const updateHeight = (e: Event) => {
  const height = +(e.target as HTMLInputElement).value
  model.value = { width: model.value.width, height }
}
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div class="inputs">
      <div class="prefixed-input">
        w&nbsp;<input
          type="number"
          :value="model.width"
          @change="updateWidth"
        />
      </div>
      <div class="prefixed-input">
        h&nbsp;<input
          type="number"
          :value="model.height"
          @change="updateHeight"
        />
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
