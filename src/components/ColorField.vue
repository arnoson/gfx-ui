<script setup lang="ts">
import { PopoverContent, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed } from 'vue'
import type { Color } from '~/types'
import { pixelColors } from '~/utils/pixels'

defineProps<{ label: string }>()
const model = defineModel<Color>({ required: true })

const name = computed(() => {
  if (model.value === 0) return 'Black'
  if (model.value === 15) return 'White'
  return `Gray #${model.value}`
})
</script>

<template>
  <div class="field">
    <label>{{ label }}</label>
    <PopoverRoot>
      <PopoverTrigger class="preview">
        <div
          class="swatch"
          :style="{ backgroundColor: pixelColors[model] }"
        ></div>
        <div class="name">{{ name }}</div>
      </PopoverTrigger>
      <PopoverContent :align="'end'" :side-offset="5">
        <div class="swatches">
          <button
            v-for="(css, index) of pixelColors"
            @click="model = index"
            class="swatch"
            :style="{ backgroundColor: css }"
          ></button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  </div>
</template>

<style scoped>
.preview {
  display: flex;
  gap: 0.3rem;
  padding-inline: 0.2rem;
  align-items: center;
  overflow: hidden;

  .swatch {
    flex-shrink: 0;
    border: 1px solid hsl(0deg 0% 33%);
  }
}

.name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  background: var(--color-background);
  border-radius: 4px;
  border: 1px solid hsl(0 0% 20% / 1);
  color: var(--color-text);
  padding: 0.5rem;

  .swatch {
    border: 1px solid hsl(0deg 0% 25%);
  }
}

.swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 0.1rem;
  padding: 0;
}
</style>
