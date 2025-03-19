<script setup lang="ts">
import { computed } from 'vue'
import { getItemBounds, type Item } from '~/items/item'

const props = defineProps<{ item: Item }>()

const bounds = computed(() => {
  // Group bounds aren't cached.
  return props.item.type === 'group'
    ? getItemBounds(props.item)
    : props.item.bounds
})
</script>

<template>
  <rect
    :key="item.id"
    class="bounds"
    :x="bounds.left"
    :y="bounds.top"
    :width="bounds.width || 0.00001"
    :height="bounds.height || 0.00001"
  />
</template>
