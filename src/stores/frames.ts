import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Bitmap } from '~/items/bitmap'
import type { Circle } from '~/items/circle'
import type { Line } from '~/items/line'
import type { Rect } from '~/items/rect'
import type { Size } from '~/types'
import { getItemBounds } from '~/utils/bounds'

type Id = number

export type Item = Rect | Line | Circle | Bitmap

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
  items: Map<Id, Item>
}

export const useFrames = defineStore('frames', () => {
  const frames = ref(new Map<Id, Frame>())

  const activeFrameId = ref<Id | null>(0)
  const activeFrame = computed(() => {
    if (activeFrameId.value == null) return null
    return frames.value.get(activeFrameId.value) ?? null
  })

  const focusedItemId = ref<Id | null>(null)
  const focusedItem = computed(() => {
    if (!focusedItemId.value) return null
    if (!activeFrame.value) return null
    return activeFrame.value.items.get(focusedItemId.value) ?? null
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
      items: new Map(),
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
    frame.items.set(id, item)
    return id
  }

  const removeItem = (frameId: Id, itemId: Id) => {
    const frame = frames.value.get(frameId)
    if (!frame) return

    frame.items.delete(itemId)
  }

  const focusItem = (id: Id) => (focusedItemId.value = id)

  const blur = () => (focusedItemId.value = null)

  return {
    frames,
    activeFrameId,
    activeFrame,
    focusedItemId,
    focusedItem,
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
