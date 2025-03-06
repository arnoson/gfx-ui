import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Bitmap } from '~/items/bitmap'
import type { Circle } from '~/items/circle'
import type { Line } from '~/items/line'
import type { Rect } from '~/items/rect'
import type { Bounds, Size } from '~/types'
import { getItemBounds, getRectBounds } from '~/utils/bounds'

type Id = number

type Group = {
  type: 'group'
  id: number
  bounds: Bounds
  children: Item[]
}

export type Item = Rect | Line | Circle | Bitmap | Group

export type ItemData =
  | Omit<Rect, 'id' | 'bounds'>
  | Omit<Line, 'id' | 'bounds'>
  | Omit<Circle, 'id' | 'bounds'>
  | Omit<Bitmap, 'id' | 'bounds'>

export interface Frame {
  id: Id
  name: string
  scale: number
  size: Size
  children: Item[]
}

export const useFrames = defineStore('frames', () => {
  const frames = ref(new Map<Id, Frame>())

  const selectionBounds = ref<Bounds | null>(null)
  const isSelecting = ref(false)
  const selectedItemIds = ref(new Set<Id>())

  const selectedItems = computed(() => {
    if (!activeFrame.value) return null

    const items: Item[] = []
    for (const id of selectedItemIds.value) {
      const item = activeFrame.value.children.find((v) => v.id === id)
      if (item) items.push(item)
    }

    return items.length ? items : null
  })
  const selectedItemBounds = computed(() => {
    if (!selectedItems.value) return null
    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity
    for (const { bounds } of selectedItems.value) {
      if (bounds.left < left) left = bounds.left
      if (bounds.right > right) right = bounds.right
      if (bounds.top < top) top = bounds.top
      if (bounds.bottom > bottom) bottom = bounds.bottom
    }
    return getRectBounds({
      position: { x: left, y: top },
      size: { width: right - left + 1, height: bottom - top + 1 },
    })
  })

  const activeFrameId = ref<Id | null>(0)
  const activeFrame = computed(() => {
    if (activeFrameId.value == null) return null
    return frames.value.get(activeFrameId.value) ?? null
  })

  const focusedItemId = ref<Id | null>(null)
  const focusedItem = computed(() => {
    if (!focusedItemId.value) return null
    if (!activeFrame.value) return null
    return activeFrame.value.children.find((v) => v.id === focusedItemId.value)
  })

  let id = 0
  const createId = () => id++

  const addFrame = () => {
    const id = createId()
    frames.value.set(id, {
      id,
      name: `Frame${id}`,
      size: { width: 128, height: 64 },
      scale: 5,
      children: [],
    })
    return id
  }

  const removeFrame = (id: Id) => frames.value.delete(id)

  const activateFrame = (id: Id) => (activeFrameId.value = id)

  const addItem = (frameId: Id, data: ItemData) => {
    const frame = frames.value.get(frameId)
    if (!frame) return

    const id = createId()
    const bounds = getItemBounds(data)
    if (!bounds) return

    const item: Item = { ...data, bounds, id }
    frame.children.push(item)
    return id
  }

  const removeItem = (frameId: Id, itemId: Id) => {
    const frame = frames.value.get(frameId)
    if (!frame) return
    frame.children.splice(frame.children.findIndex((v) => v.id === itemId))
  }

  const focusItem = (id: Id) => {
    selectedItemIds.value.clear()
    focusedItemId.value = id
  }

  const blur = () => (focusedItemId.value = null)

  return {
    frames,
    activeFrameId,
    activeFrame,
    focusedItemId,
    focusedItem,
    selectionBounds,
    selectedItems,
    selectedItemBounds,
    isSelecting,
    selectedItemIds,
    addFrame,
    removeFrame,
    activateFrame,
    addItem,
    removeItem,
    focusItem,
    blur,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useFrames, import.meta.hot))
