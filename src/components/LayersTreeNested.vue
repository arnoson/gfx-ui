<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Item } from '~/items/item'

const list = defineModel<Item[]>({ required: true })
</script>

<template>
  <VueDraggable
    tag="ul"
    class="layers"
    group="g1"
    v-model="list"
    :swap-threshold="1"
    :invert-swap="true"
  >
    <li v-for="item in list" :key="item.id">
      <details v-if="item.type === 'group'" open>
        <summary>
          <button class="layer">{{ item.type }}@{{ item.id }}</button>
        </summary>
        <LayersTreeNested
          v-if="item.type === 'group'"
          v-model="item.children"
          class="children"
        />
      </details>
      <button v-else class="layer">{{ item.type }}@{{ item.id }}</button>
    </li>
  </VueDraggable>
</template>

<style scoped>
.layers {
  list-style: none;
  padding: 0;
}

.layers,
details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.children {
  margin-left: 1rem;
}

.layer {
  &:hover:not([data-highlight='true']) {
    background-color: var(--color-panel-background);
    color: var(--color-panel-text);
  }

  &[data-highlight='true'] {
    background-color: var(--color-accent);
  }
}
</style>
