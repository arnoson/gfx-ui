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

const alignLeft = () => {
  if (!editor.selectedItemBounds) return
  const { left } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    moveItem(item, { x: left, y: bounds.y })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const alignCenter = () => {
  if (!editor.selectedItemBounds) return
  const { left, right } = editor.selectedItemBounds
  let center = left + Math.round((right - left) / 2)
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const x = Math.round(center - bounds.width / 2)
    moveItem(item, { x, y: bounds.y })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const alignRight = () => {
  if (!editor.selectedItemBounds) return
  const { right } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const x = right - bounds.width
    moveItem(item, { x, y: bounds.y })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const alignTop = () => {
  if (!editor.selectedItemBounds) return
  const { top } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    moveItem(item, { x: bounds.x, y: top })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const alignMiddle = () => {
  if (!editor.selectedItemBounds) return
  const { top, bottom } = editor.selectedItemBounds
  let middle = top + Math.round((bottom - top) / 2)
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const y = Math.round(middle - bounds.height / 2)
    moveItem(item, { x: bounds.x, y })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

const alignBottom = () => {
  if (!editor.selectedItemBounds) return
  const { bottom } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const y = bottom - bounds.height
    moveItem(item, { x: bounds.x, y })
    if (item.bounds !== null) item.bounds = getItemBounds(item)
  }
}

type Axis = 'horizontal' | 'vertical'
const axisProps = {
  horizontal: { start: 'left', end: 'right', size: 'width', coordinate: 'x' },
  vertical: { start: 'top', end: 'bottom', size: 'height', coordinate: 'y' },
} as const

const sortItemsByAxis = (items: Item[], axis: Axis) => {
  const { start } = axisProps[axis]
  return items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA[start] - boundsB[start]
  })
}

const distribute = (axis: Axis, gap?: number) => {
  if (!editor.selectedItemBounds || props.items.length < 2) return

  const { start, size, coordinate } = axisProps[axis]

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

  const { start, end } = axisProps[axis]
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
      <button @click="alignLeft"><IconAlignLeft /></button>
      <button @click="alignCenter"><IconAlignCenter /></button>
      <button @click="alignRight"><IconAlignRight /></button>
      <button @click="alignTop"><IconAlignTop /></button>
      <button @click="alignMiddle"><IconAlignMiddle /></button>
      <button @click="alignBottom"><IconAlignBottom /></button>
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
