import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getItemBounds,
  type Item,
  type ItemByType,
  type ItemData,
} from '~/items/item'
import { useCircle } from '~/tools/circle'
import { useLine } from '~/tools/line'
import { usePencil } from '~/tools/pencil'
import { useRect } from '~/tools/rect'
import { useSelect } from '~/tools/select'
import { useText } from '~/tools/text'
import type { Bounds, Point, Size } from '~/types'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { addPoints } from '~/utils/point'
import { getBoundsSnap, getPointSnap } from '~/utils/snap'
import { capitalizeFirstLetter } from '~/utils/text'

type Id = number

export interface Frame {
  id: Id
  name: string
  scale: number
  size: Size
  children: Item[]
}

let id = 0
const createId = () => id++

const flattenNestedItems = (items: Item[]): Item[] => {
  const result: Item[] = []
  const stack: Item[] = [...items]
  while (stack.length) {
    const current = stack.pop()!
    result.push(current)
    if (current.type === 'group') stack.push(...current.children)
  }
  return result
}

export const useEditor = defineStore('editor', () => {
  // Tools
  const pencil = usePencil()
  const select = useSelect()
  const rect = useRect()
  const circle = useCircle()
  const line = useLine()
  const text = useText()
  const tools = { select, rect, circle, line, text, pencil }
  type ToolId = keyof typeof tools

  const activeToolId = ref<ToolId>('select')
  const activeTool = computed(() => tools[activeToolId.value])

  const activateTool = (id: ToolId) => {
    activeTool.value.deactivate?.()
    activeToolId.value = id
    tools[id].activate?.()
  }

  activateTool(activeToolId.value)

  // Frames
  const frames = ref<Frame[]>([])
  const activeFrame = ref<Frame>()
  const frameBounds = computed(() => {
    if (!activeFrame.value) return emptyBounds
    return makeBounds({ x: 0, y: 0 }, activeFrame.value.size)
  })

  const addFrame = (data: Partial<Frame>): Frame => {
    const id = createId()
    frames.value.push({
      id,
      children: [],
      ...data,
      size: data.size ?? { width: 128, height: 64 },
      name: data.name ?? `Frame${id}`,
      scale: data.scale ?? 5,
    })
    return frames.value.at(-1)!
  }

  const removeFrame = (id: Id) => {
    frames.value.splice(
      frames.value.findIndex((v) => v.id === id),
      1,
    )
    if (activeFrame.value?.id === id) activeFrame.value = undefined
  }

  const activateFrame = (id: Id) => {
    activeFrame.value = frames.value.find((v) => v.id === id)
    selectedItems.value.clear()
    focusedItem.value = null
    selectionBounds.value = null
  }

  // Items
  const items = computed(() => activeFrame.value?.children ?? [])
  const itemsFlat = computed(() => {
    if (!activeFrame.value) return []
    return flattenNestedItems(activeFrame.value.children)
  })

  const focusedItem = ref<Item | null>(null)
  const copiedItems = ref<Item[] | null>(null)

  const addItem = <T extends ItemData, R = ItemByType<T['type']>>(
    data: T,
  ): R | undefined => {
    if (!activeFrame.value) return

    const id = createId()
    const bounds = data.type !== 'group' ? getItemBounds(data) : null
    const name = capitalizeFirstLetter(data.type)
    const item = {
      isLocked: false,
      isHidden: false,
      name,
      ...data,
      bounds,
      id,
    } as R
    activeFrame.value.children.unshift(item as Item)
    // Pushing the item makes it reactive, so in order return the reactive item
    // we have to retrieve it from children.
    return activeFrame.value.children[0] as R
  }

  const removeItem = (item: Item, frame = activeFrame.value) => {
    if (!frame) return
    const index = frame.children.findIndex((v) => v.id === item.id)
    frame.children.splice(index, 1)
  }

  const focusItem = (item: Item) => {
    focusedItem.value = item
    selectedItems.value.clear()
    selectedItems.value.add(item)
  }

  // Selection
  const selectionBounds = ref<Bounds | null>(null)
  const isSelecting = ref(false)
  const isMoving = ref(false)
  const selectedItems = ref(new Set<Item>())

  const selectedItemBounds = computed(() => {
    if (!selectedItems.value.size) return null

    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity

    for (const item of selectedItems.value) {
      const bounds = item.bounds ?? getItemBounds(item)
      if (bounds.left < left) left = bounds.left
      if (bounds.right > right) right = bounds.right
      if (bounds.top < top) top = bounds.top
      if (bounds.bottom > bottom) bottom = bounds.bottom
    }
    return makeBounds(
      { x: left, y: top },
      { width: right - left, height: bottom - top },
    )
  })

  // Snapping
  const snapThreshold = computed(() => {
    // Allow more precise alignment when zoomed in.
    const scale = activeFrame.value?.scale ?? 1
    return Math.ceil(5 / scale)
  })

  const snapGuides = ref<{
    vertical?: { from: Point; to: Point }
    horizontal?: { from: Point; to: Point }
  } | null>(null)

  const resetSnapGuides = (
    direction: 'horizontal' | 'vertical' | 'both' = 'both',
  ) => {
    if (!snapGuides.value) return
    if (direction === 'both') snapGuides.value = null
    if (direction === 'vertical') snapGuides.value!.vertical = undefined
    if (direction === 'horizontal') snapGuides.value!.horizontal = undefined
  }

  const snapPoint = (point: Point, ignoreTargets: Item[] = []) => {
    const ignoreTargetsFlat = flattenNestedItems(ignoreTargets)
    const targets = itemsFlat.value
      .filter((v) => v.type !== 'group' && !ignoreTargetsFlat.includes(v))
      .map((v) => v.bounds!)

    targets.push(frameBounds.value)
    const { amount, guides } = getPointSnap(point, targets, snapThreshold.value)
    snapGuides.value = guides
    return addPoints(point, amount)
  }

  const snapBounds = (bounds: Bounds, ignoreTargets: Item[] = []) => {
    const ignoreTargetsFlat = flattenNestedItems(ignoreTargets)
    const targets = itemsFlat.value
      .filter((v) => !ignoreTargetsFlat.includes(v))
      .map((v) => v.bounds!)

    targets.push(frameBounds.value)
    const { amount, guides } = getBoundsSnap(
      bounds,
      targets,
      snapThreshold.value,
    )
    snapGuides.value = guides
    // TODO: snapPoint should either also return the amount or this should
    // return the modified bounds.
    return amount
  }

  return {
    tools,
    activeTool,
    activateTool,
    frames,
    activeFrame,
    frameBounds,
    addFrame,
    removeFrame,
    activateFrame,
    items,
    itemsFlat,
    copiedItems,
    focusedItem,
    addItem,
    removeItem,
    focusItem,
    selectionBounds,
    selectedItems,
    selectedItemBounds,
    isSelecting,
    isMoving,
    snapThreshold,
    snapGuides,
    resetSnapGuides,
    snapPoint,
    snapBounds,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEditor, import.meta.hot))
