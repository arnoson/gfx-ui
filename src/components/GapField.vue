<script setup lang="ts">
import { getInputId } from '~/utils/id'

defineProps<{ label: string }>()
const horizontal = defineModel<number | undefined>('horizontal', {
  required: true,
})
const vertical = defineModel<number | undefined>('vertical', {
  required: true,
})
const id = getInputId()
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div :id="id" class="inputs">
      <div class="prefixed-input">
        x&nbsp;
        <input
          type="number"
          v-model="horizontal"
          :placeholder="horizontal === undefined ? 'mixed' : ''"
          label="Gap"
        />
      </div>
      <div class="prefixed-input">
        y&nbsp;
        <input
          type="number"
          v-model="vertical"
          :placeholder="vertical === undefined ? 'mixed' : ''"
          label="Gap"
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
