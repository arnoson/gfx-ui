<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useEditor } from '~/stores/editor'

const editor = useEditor()

const list = computed(() => {
  if (!editor.activeFrame) return []
  return Array.from(editor.activeFrame?.children.values())
})

const onUpdate = console.log
</script>

<template>
  <VueDraggable
    v-if="editor.activeFrame"
    class="flow"
    v-model="editor.activeFrame.children"
    @update="onUpdate"
  >
    <div
      v-for="item in list"
      :key="item.id"
      class="layer"
      :data-highlight="
        item === editor.focusedItem || editor.selectedItemIds.has(item.id)
      "
      @click="editor.focusedItem = item"
    >
      {{ item.type }}@{{ item.id }}
    </div>
  </VueDraggable>
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
