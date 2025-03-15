<script setup lang="ts">
import type { Item } from '~/items/item'
import CircleControls from './CircleControls.vue'
import LineControls from './LineControls.vue'
import RectControls from './RectControls.vue'

defineProps<{ item: Item }>()
</script>

<template>
  <LineControls v-if="item.type === 'line'" :item="item" />
  <RectControls v-else-if="item.type === 'rect'" :item="item" />
  <CircleControls v-else-if="item.type === 'circle'" :item="item" />
</template>
