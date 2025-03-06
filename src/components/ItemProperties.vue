<script setup lang="ts">
import { type Item } from '~/stores/frames'
import BitmapProperties from './BitmapProperties.vue'
import CircleProperties from './CircleProperties.vue'
import RectProperties from './RectProperties.vue'
import LineProperties from './LineProperties.vue'

defineProps<{ item: Item }>()
</script>

<template>
  <BitmapProperties v-if="item.type === 'bitmap'" :item="item" />
  <RectProperties v-else-if="item.type === 'rect'" :item />
  <CircleProperties v-else-if="item.type === 'circle'" :item />
  <LineProperties v-else-if="item.type === 'line'" :item />
</template>
