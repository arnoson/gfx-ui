<script setup lang="ts">
import { useEventListener, useMagicKeys } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import { instance } from '~/items/instance'
import { itemFromCode, type Item } from '~/items/item'
import { getPolygonPoints } from '~/items/polygon'
import { useEditor } from '~/stores/editor'
import { emptyBounds } from '~/utils/bounds'

const props = defineProps<{ item: Item; isGrouped?: boolean }>()
const editor = useEditor()

const { ctrl } = useMagicKeys()

const handle = useTemplateRef('handle')
useEventListener(handle, 'mousedown', (e) => {
  // Allow focusing grouped items when ctrl key is pressed.
  // TODO: once an grouped item is focused it should act as an ungrouped item
  // even if the ctrl key isn't pressed afterwards.
  if (props.item.type === 'group' && ctrl.value) return
  if (props.isGrouped && !ctrl.value) return
  editor.focusItem(props.item)
})

const bounds = computed(() => {
  if (props.item.type === 'group') return emptyBounds
  if (props.item.type === 'instance') return instance.getBounds(props.item)
  return props.item.bounds
})
</script>

<template>
  <template v-if="!item.isHidden && !item.isLocked">
    <!-- Bitmap -->
    <rect
      v-if="item.type === 'bitmap'"
      ref="handle"
      :x="bounds.topLeft.x"
      :y="bounds.topLeft.y"
      :width="bounds.width"
      :height="bounds.height"
      fill="transparent"
    />
    <!-- Circle -->
    <circle
      v-else-if="item.type === 'circle'"
      ref="handle"
      :cx="bounds.left + bounds.width / 2 + 0.5"
      :cy="bounds.top + bounds.height / 2 + 0.5"
      :r="bounds.width / 2"
      :fill="item.isFilled ? 'transparent' : 'none'"
      stroke="transparent"
      stroke-width="3"
    />
    <!-- Line -->
    <line
      v-else-if="item.type === 'line'"
      ref="handle"
      :x1="item.from.x + 0.5"
      :y1="item.from.y + 0.5"
      :x2="item.to.x + 0.5"
      :y2="item.to.y + 0.5"
      stroke="transparent"
      stroke-width="4"
    />
    <!-- Rect -->
    <rect
      v-else-if="item.type === 'rect'"
      ref="handle"
      :x="bounds.left"
      :y="bounds.top"
      :width="bounds.width"
      :height="bounds.height"
      :fill="item.isFilled ? 'transparent' : 'none'"
      stroke="transparent"
      stroke-width="3"
    />
    <!-- Polygon -->
    <polygon
      v-else-if="item.type === 'polygon'"
      ref="handle"
      :points="
        getPolygonPoints(item)
          .map(({ x, y }) => [x, y].join(','))
          .join(' ')
      "
      :fill="item.isFilled ? 'transparent' : 'none'"
      stroke="transparent"
      stroke-width="3"
    />
    <!-- Text -->
    <rect
      v-else-if="item.type === 'text'"
      ref="handle"
      :x="bounds.left"
      :y="bounds.top"
      :width="bounds.width"
      :height="bounds.height"
      fill="transparent"
    />
    <!-- Instance -->
    <rect
      v-else-if="item.type === 'instance'"
      ref="handle"
      :x="bounds.left"
      :y="bounds.top"
      :width="bounds.width"
      :height="bounds.height"
      fill="transparent"
    />
    <!-- Group -->
    <g v-else-if="item.type === 'group'" ref="handle">
      <ItemHandle
        v-for="child of item.children"
        :key="child.id"
        :item="child"
        :is-grouped="true"
      />
    </g>
  </template>
</template>
