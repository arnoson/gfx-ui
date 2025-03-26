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

const props = defineProps<{ items: Item[] }>()
const editor = useEditor()

const alignLeft = () => {
  if (!editor.selectedItemBounds) return
  const { left } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    moveItem(item, { x: left, y: bounds.y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
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
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignRight = () => {
  if (!editor.selectedItemBounds) return
  const { right } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const x = right - bounds.width
    moveItem(item, { x, y: bounds.y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignTop = () => {
  if (!editor.selectedItemBounds) return
  const { top } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    moveItem(item, { x: bounds.x, y: top })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
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
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignBottom = () => {
  if (!editor.selectedItemBounds) return
  const { bottom } = editor.selectedItemBounds
  for (const item of props.items) {
    const bounds = item.bounds ?? getItemBounds(item)
    const y = bottom - bounds.height
    moveItem(item, { x: bounds.x, y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const distributeHorizontal = (gap?: number) => {
  if (!editor.selectedItemBounds) return
  if (props.items.length < 2) return

  if (gap === undefined) {
    let allWidths = 0
    for (const item of props.items) {
      const { width } = item.bounds ?? getItemBounds(item)
      allWidths += width
    }
    let space = editor.selectedItemBounds.width - allWidths - 1
    gap = Math.round(space / (props.items.length - 1))
  }

  const itemsLeftToRight = props.items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA.left - boundsB.left
  })
  let offset = editor.selectedItemBounds.left
  for (const item of itemsLeftToRight) {
    const { y, width } = item.bounds ?? getItemBounds(item)
    moveItem(item, { x: offset, y })
    offset += width + gap
    item.bounds = getItemBounds(item)
  }
}

const distributeVertical = (gap?: number) => {
  if (!editor.selectedItemBounds) return
  if (props.items.length < 2) return

  if (gap === undefined) {
    let allHeights = 0
    for (const item of props.items) {
      const { height } = item.bounds ?? getItemBounds(item)
      allHeights += height
    }
    let space = editor.selectedItemBounds.height - allHeights - 1
    gap = Math.round(space / (props.items.length - 1))
  }

  const itemsTopToBottom = props.items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA.top - boundsB.top
  })
  let offset = editor.selectedItemBounds.top
  for (const item of itemsTopToBottom) {
    const { x, height } = item.bounds ?? getItemBounds(item)
    moveItem(item, { x, y: offset })
    offset += height + gap
    item.bounds = getItemBounds(item)
  }
}

const distributedVerticalGap = computed(() => {
  if (!editor.selectedItemBounds) return
  if (props.items.length < 2) return

  const itemsTopToBottom = props.items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA.top - boundsB.top
  })

  let lastGap: number | undefined
  for (let i = 1; i < itemsTopToBottom.length; i++) {
    const lastItem = itemsTopToBottom[i - 1]
    const lastItemBounds = lastItem.bounds ?? getItemBounds(lastItem)
    const item = itemsTopToBottom[i]
    const itemBounds = item.bounds ?? getItemBounds(item)
    const gap = itemBounds.top - lastItemBounds.bottom - 1
    if (lastGap !== undefined && gap !== lastGap) return
    lastGap = gap
  }

  return lastGap
})

const distributedHorizontalGap = computed(() => {
  if (!editor.selectedItemBounds) return
  if (props.items.length < 2) return

  const itemsLeftToRight = props.items.toSorted((a, b) => {
    const boundsA = a.bounds ?? getItemBounds(a)
    const boundsB = b.bounds ?? getItemBounds(b)
    return boundsA.left - boundsB.left
  })

  let lastGap: number | undefined
  for (let i = 1; i < itemsLeftToRight.length; i++) {
    const lastItem = itemsLeftToRight[i - 1]
    const lastItemBounds = lastItem.bounds ?? getItemBounds(lastItem)
    const item = itemsLeftToRight[i]
    const itemBounds = item.bounds ?? getItemBounds(item)
    const gap = itemBounds.left - lastItemBounds.right - 1
    if (lastGap !== undefined && gap !== lastGap) return
    lastGap = gap
  }

  return lastGap
})
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
      <button @click="distributeHorizontal()">Horizontal</button>
      <button @click="distributeVertical()">Vertical</button>
    </div>
    <GapField
      :horizontal="distributedHorizontalGap"
      :vertical="distributedVerticalGap"
      label="Gap"
      @update:horizontal="distributeHorizontal($event)"
      @update:vertical="distributeVertical($event)"
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
