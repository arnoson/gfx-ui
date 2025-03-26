<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { getInputId } from '~/utils/id'

defineProps<{ label: string }>()
const model = defineModel<boolean>({ required: true })
const id = getInputId()
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <SwitchRoot :id="id" v-model="model" class="switch-root">
      <SwitchThumb class="switch-thumb" />
    </SwitchRoot>
  </div>
</template>

<style scoped>
button {
  all: unset;
}

.switch-root {
  --switch-size: 16px;
  --switch-padding: 1px;

  width: calc(var(--switch-size) * 2);
  height: calc(var(--switch-size) + 2 * var(--switch-padding));
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  position: relative;
  cursor: pointer;

  &[data-state='checked'] {
    background-color: var(--color-accent);
  }
}

.switch-thumb {
  display: block;
  width: var(--switch-size);
  height: var(--switch-size);
  background-color: var(--color-panel-background);
  border-radius: 9999px;

  transition: transform 100ms;
  transform: translateX(var(--switch-padding));
  will-change: transform;

  &[data-state='checked'] {
    transform: translateX(calc(var(--switch-size) - var(--switch-padding)));
  }

  .switch-root:hover &,
  &[data-state='checked'] {
    background-color: var(--color-text);
  }
}
</style>
