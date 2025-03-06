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
    v-model="frames.activeFrame.children"
    @update="onUpdate"
  >
    <div v-for="item in list" :key="item.id">{{ item.type }}@{{ item.id }}</div>
  </VueDraggable>
</template>
