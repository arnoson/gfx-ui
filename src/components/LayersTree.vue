<script setup lang="ts">
import { useEditor } from '~/stores/editor'
import LayersTreeNested from './LayersTreeNested.vue'
const editor = useEditor()
</script>

<template>
  <LayersTreeNested
    v-if="editor.activeFrame"
    v-model="editor.activeFrame.children"
  />
</template>

<style scoped>
.layer {
  cursor: default;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;

  &:hover:not([data-highlight='true']) {
    background-color: var(--color-panel-background);
    color: var(--color-panel-text);
  }

  &[data-highlight='true'] {
    background-color: var(--color-accent);
  }
}
</style>
