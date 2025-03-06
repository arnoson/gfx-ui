<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useFrames } from '~/stores/frames'

const frames = useFrames()

const list = computed(() => {
  if (!frames.activeFrame) return []
  return Array.from(frames.activeFrame?.children.values())
})

const onUpdate = console.log
</script>

<template>
  <VueDraggable
    v-if="frames.activeFrame"
    class="flow"
    v-model="frames.activeFrame.children"
    @update="onUpdate"
  >
    <div
      v-for="item in list"
      :key="item.id"
      class="layer"
      :data-highlight="
        item.id === frames.focusedItemId || frames.selectedItemIds.has(item.id)
      "
      @click="frames.focusItem(item.id)"
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
