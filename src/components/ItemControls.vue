<script setup lang="ts">
import type { Item } from '~/items/item'
import CircleControls from './CircleControls.vue'
import LineControls from './LineControls.vue'
import RectControls from './RectControls.vue'
import PolygonControls from './PolygonControls.vue'

defineProps<{ item: Item }>()
</script>

<template>
  <template v-if="!item.isHidden && !item.isLocked">
    <LineControls v-if="item.type === 'line'" :item />
    <RectControls v-else-if="item.type === 'rect'" :item />
    <CircleControls v-else-if="item.type === 'circle'" :item />
    <PolygonControls v-else-if="item.type === 'polygon'" :item />
  </template>
</template>
