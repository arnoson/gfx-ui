<script setup lang="ts">
import { useEventListener, useMagicKeys } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { type Item } from '~/items/item'
import { useEditor } from '~/stores/editor'

const props = defineProps<{ item: Item; isGrouped?: boolean }>()
const editor = useEditor()

const { ctrl } = useMagicKeys()

const handle = useTemplateRef('handle')
useEventListener(handle, 'mousedown', () => {
  // Allow focusing grouped items when ctrl key is pressed.
  // TODO: once an grouped item is focused it should act as an ungrouped item
  // even if the ctrl key isn't pressed afterwards.
  if (props.item.type === 'group' && ctrl.value) return
  if (props.isGrouped && !ctrl.value) return
  editor.focusItem(props.item)
})
</script>

<template>
  <template v-if="!item.isHidden && !item.isLocked">
    <!-- Bitmap -->
    <rect
      v-if="item.type === 'bitmap'"
      ref="handle"
      :x="item.bounds.topLeft.x"
      :y="item.bounds.topLeft.y"
      :width="item.bounds.width"
      :height="item.bounds.height"
      fill="transparent"
    />
    <!-- Circle -->
    <circle
      v-else-if="item.type === 'circle'"
      ref="handle"
      :cx="item.bounds.left + item.bounds.width / 2 + 0.5"
      :cy="item.bounds.top + item.bounds.height / 2 + 0.5"
      :r="item.bounds.width / 2"
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
      :x="item.bounds.left"
      :y="item.bounds.top"
      :width="item.bounds.width"
      :height="item.bounds.height"
      :fill="item.isFilled ? 'transparent' : 'none'"
      stroke="transparent"
      stroke-width="3"
    />
    <!-- Text -->
    <rect
      v-else-if="item.type === 'text'"
      ref="handle"
      :x="item.bounds.left"
      :y="item.bounds.top"
      :width="item.bounds.width"
      :height="item.bounds.height"
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
