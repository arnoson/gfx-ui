<script setup lang="ts">
import type { Item } from '~/items/item'
import DrawIcon from '~/assets/icons/icon-layer-draw.svg'
import CircleIcon from '~/assets/icons/icon-layer-circle.svg'
import LineIcon from '~/assets/icons/icon-layer-line.svg'
import RectIcon from '~/assets/icons/icon-layer-rect.svg'
import TextIcon from '~/assets/icons/icon-layer-text.svg'
import InstanceIcon from '~/assets/icons/icon-layer-instance.svg'
import GroupIcon from '~/assets/icons/icon-layer-group.svg'
import PolygonIcon from '~/assets/icons/icon-layer-polygon.svg'

defineProps<{ item: Item }>()
</script>

<template>
  <DrawIcon v-if="item.type === 'bitmap'" />
  <CircleIcon v-else-if="item.type === 'circle'" />
  <LineIcon v-else-if="item.type === 'line'" />
  <RectIcon v-else-if="item.type === 'rect'" />
  <TextIcon v-else-if="item.type === 'text'" />
  <InstanceIcon v-else-if="item.type === 'instance'" />
  <GroupIcon v-else-if="item.type === 'group'" />
  <PolygonIcon v-else-if="item.type === 'polygon'" />
</template>
