<script setup lang="ts">
import type { Item } from '~/stores/frames'
import BitmapControls from './BitmapControls.vue'
import CircleControls from './CircleControls.vue'
import LineControls from './LineControls.vue'
import RectControls from './RectControls.vue'
import TextControls from './TextControls.vue'

defineProps<{ item: Item }>()
</script>

<template>
  <LineControls v-if="item.type === 'line'" :item="item" />
  <RectControls v-else-if="item.type === 'rect'" :item="item" />
  <CircleControls v-else-if="item.type === 'circle'" :item="item" />
  <BitmapControls v-else-if="item.type === 'bitmap'" :item="item" />
  <TextControls v-else-if="item.type === 'text'" :item="item" />
</template>
