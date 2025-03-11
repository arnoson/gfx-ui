<script setup lang="ts">
import { computed } from 'vue'
import { getItemBounds, moveItem } from '~/items/item'
import GapField from './GapField.vue'
import { useEditor } from '~/stores/editor'

const editor = useEditor()

const alignLeft = () => {
  if (!editor.selectedItemBounds) return
  const { left } = editor.selectedItemBounds
  for (const item of editor.selectedItems ?? []) {
    moveItem(item, { x: left, y: item.bounds.y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignCenter = () => {
  if (!editor.selectedItemBounds) return
  const { left, right } = editor.selectedItemBounds
  let center = left + Math.round((right - left) / 2)
  for (const item of editor.selectedItems ?? []) {
    const x = Math.round(center - item.bounds.width / 2)
    moveItem(item, { x, y: item.bounds.y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignRight = () => {
  if (!editor.selectedItemBounds) return
  const { right } = editor.selectedItemBounds
  for (const item of editor.selectedItems ?? []) {
    const x = right - item.bounds.width + 1
    moveItem(item, { x, y: item.bounds.y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignTop = () => {
  if (!editor.selectedItemBounds) return
  const { top } = editor.selectedItemBounds
  for (const item of editor.selectedItems ?? []) {
    moveItem(item, { x: item.bounds.x, y: top })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignMiddle = () => {
  if (!editor.selectedItemBounds) return
  const { top, bottom } = editor.selectedItemBounds
  let middle = top + Math.round((bottom - top) / 2)
  for (const item of editor.selectedItems ?? []) {
    const y = Math.round(middle - item.bounds.height / 2)
    moveItem(item, { x: item.bounds.x, y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const alignBottom = () => {
  if (!editor.selectedItemBounds) return
  const { bottom } = editor.selectedItemBounds
  for (const item of editor.selectedItems ?? []) {
    const y = bottom - item.bounds.height + 1
    moveItem(item, { x: item.bounds.x, y })
    if (item.type !== 'group') item.bounds = getItemBounds(item)
  }
}

const distributeHorizontal = (gap?: number) => {
  if (!editor.selectedItemBounds) return
  if (!editor.selectedItems || editor.selectedItems.length < 2) return

  if (gap === undefined) {
    let allWidths = 0
    for (const item of editor.selectedItems) allWidths += item.bounds.width
    let space = editor.selectedItemBounds.width - allWidths - 1
    gap = Math.round(space / (editor.selectedItems.length - 1))
  }

  const itemsLeftToRight = editor.selectedItems.sort(
    (a, b) => a.bounds.left - b.bounds.left,
  )
  let offset = editor.selectedItemBounds.left
  for (const item of itemsLeftToRight) {
    if (item.type === 'group') continue
    moveItem(item, { x: offset, y: item.bounds.y })
    offset += item.bounds.width + gap
    item.bounds = getItemBounds(item)
  }
}

const distributeVertical = (gap?: number) => {
  if (!editor.selectedItemBounds) return
  if (!editor.selectedItems || editor.selectedItems.length < 2) return

  if (gap === undefined) {
    let allHeights = 0
    for (const item of editor.selectedItems) allHeights += item.bounds.height
    let space = editor.selectedItemBounds.height - allHeights - 1
    gap = Math.round(space / (editor.selectedItems.length - 1))
  }

  const itemsTopToBottom = editor.selectedItems.sort(
    (a, b) => a.bounds.top - b.bounds.top,
  )
  let offset = editor.selectedItemBounds.top
  for (const item of itemsTopToBottom) {
    if (item.type === 'group') continue
    moveItem(item, { x: item.bounds.x, y: offset })
    offset += item.bounds.height + gap
    item.bounds = getItemBounds(item)
  }
}

const distributedVerticalGap = computed(() => {
  if (!editor.selectedItemBounds) return
  if (!editor.selectedItems || editor.selectedItems.length < 2) return

  const itemsTopToBottom = editor.selectedItems.sort(
    (a, b) => a.bounds.top - b.bounds.top,
  )

  let lastGap: number | undefined
  for (let i = 1; i < itemsTopToBottom.length; i++) {
    const lastItem = itemsTopToBottom[i - 1]
    const item = itemsTopToBottom[i]
    const gap = item.bounds.top - lastItem.bounds.bottom - 1
    if (lastGap !== undefined && gap !== lastGap) return
    lastGap = gap
  }

  return lastGap
})

const distributedHorizontalGap = computed(() => {
  if (!editor.selectedItemBounds) return
  if (!editor.selectedItems || editor.selectedItems.length < 2) return

  const itemsLeftToRight = editor.selectedItems.sort(
    (a, b) => a.bounds.left - b.bounds.left,
  )

  let lastGap: number | undefined
  for (let i = 1; i < itemsLeftToRight.length; i++) {
    const lastItem = itemsLeftToRight[i - 1]
    const item = itemsLeftToRight[i]
    const gap = item.bounds.left - lastItem.bounds.right - 1
    if (lastGap !== undefined && gap !== lastGap) return
    lastGap = gap
  }

  return lastGap
})
</script>

<template>
  <div class="flow">
    <h2>{{ editor.selectedItems?.length || 0 }} selected</h2>
    <div class="flow">
      <label>Align</label>
      <div class="buttons-align">
        <button @click="alignLeft">Left</button>
        <button @click="alignCenter">Center</button>
        <button @click="alignRight">Right</button>
        <button @click="alignTop">top</button>
        <button @click="alignMiddle">middle</button>
        <button @click="alignBottom">bottom</button>
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
</style>
