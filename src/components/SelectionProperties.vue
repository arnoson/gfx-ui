<script setup lang="ts">
import { computed } from 'vue'
import { getItemBounds, moveItem, type Item } from '~/items/item'
import GapField from './GapField.vue'
import { useEditor } from '~/stores/editor'
import IconAlignLeft from '~/assets/icons/icon-align-left.svg'
import IconAlignCenter from '~/assets/icons/icon-align-center.svg'
import IconAlignRight from '~/assets/icons/icon-align-right.svg'
import IconAlignTop from '~/assets/icons/icon-align-top.svg'
import IconAlignMiddle from '~/assets/icons/icon-align-middle.svg'
import IconAlignBottom from '~/assets/icons/icon-align-bottom.svg'
import type { Point } from '~/types'

const props = defineProps<{ items: Item[] }>()
const editor = useEditor()

type Axis = 'horizontal' | 'vertical'
type AlignType = 'start' | 'center' | 'end'
const axes = {
  horizontal: { start: 'left', end: 'right', size: 'width', coordinate: 'x' },
  vertical: { start: 'top', end: 'bottom', size: 'height', coordinate: 'y' },
} as const

const align = (axis: Axis, type: AlignType) => {
  if (!editor.selectedItemBounds) return
  const selectedItemBounds = structuredClone(editor.selectedItemBounds)
  const { start, end, size, coordinate } = axes[axis]

  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const point: Point = { x: bounds.x, y: bounds.y }

    if (type === 'start') {
      point[coordinate] = selectedItemBounds[start]
    } else if (type === 'end') {
      point[coordinate] = selectedItemBounds[end] - bounds[size]
    } else {
      const center = selectedItemBounds.center[coordinate]
      point[coordinate] = Math.round(center - bounds[size] / 2)
    }

    moveItem(item, point)
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const sortItemsByAxis = (items: Item[], axis: Axis) => {
  const { start } = axes[axis]
  return items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA[start] - boundsB[start]
  })
}

const distribute = (axis: Axis, gap?: number) => {
  if (!editor.selectedItemBounds || props.items.length < 2) return

  const { start, size, coordinate } = axes[axis]

  if (gap === undefined) {
    let totalSize = 0
    for (const item of props.items) {
      const bounds = item.bounds ?? getItemBounds(item)
      totalSize += bounds[size]
    }
    const space = editor.selectedItemBounds[size] - totalSize - 1
    gap = Math.round(space / (props.items.length - 1))
  }

  const sortedItems = sortItemsByAxis(props.items, axis)
  let offset = editor.selectedItemBounds[start]

  for (const item of sortedItems) {
    const bounds = item.bounds ?? getItemBounds(item)
    const position: Point = {
      x: coordinate === 'x' ? offset : bounds.x,
      y: coordinate === 'y' ? offset : bounds.y,
    }
    moveItem(item, position)
    offset += bounds[size] + gap
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const getDistributedGap = (axis: Axis) => {
  if (!editor.selectedItemBounds || props.items.length < 2) return

  const { start, end } = axes[axis]
  const sortedItems = sortItemsByAxis(props.items, axis)

  let lastGap: number | undefined
  for (let i = 1; i < sortedItems.length; i++) {
    const lastItem = sortedItems[i - 1]
    const lastItemBounds = lastItem.bounds ?? getItemBounds(lastItem)
    const item = sortedItems[i]
    const itemBounds = item.bounds ?? getItemBounds(item)
    const gap = itemBounds[start] - lastItemBounds[end]
    if (lastGap !== undefined && gap !== lastGap) return
    lastGap = gap
  }

  return lastGap
}

const distributedHorizontalGap = computed(() => getDistributedGap('horizontal'))
const distributedVerticalGap = computed(() => getDistributedGap('vertical'))
</script>

<template>
  <div class="flow">
    <label>Align</label>
    <div class="buttons-align">
      <button @click="align('horizontal', 'start')"><IconAlignLeft /></button>
      <button @click="align('horizontal', 'center')">
        <IconAlignCenter />
      </button>
      <button @click="align('horizontal', 'end')"><IconAlignRight /></button>
      <button @click="align('vertical', 'start')"><IconAlignTop /></button>
      <button @click="align('vertical', 'center')"><IconAlignMiddle /></button>
      <button @click="align('vertical', 'end')"><IconAlignBottom /></button>
    </div>
  </div>
  <div class="flow">
    <label>Distribute</label>
    <div class="buttons-distribute">
      <button @click="distribute('horizontal')">Horizontal</button>
      <button @click="distribute('vertical')">Vertical</button>
    </div>
    <GapField
      :horizontal="distributedHorizontalGap"
      :vertical="distributedVerticalGap"
      label="Gap"
      @update:horizontal="distribute('horizontal', $event)"
      @update:vertical="distribute('vertical', $event)"
    />
  </div>
</template>

<style scoped>
.buttons-align {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.2rem;
}

.buttons-distribute {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem;
}

button:has(svg) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: max-content;
  padding-block: 0;
}

button svg {
  display: block;
}
</style>
