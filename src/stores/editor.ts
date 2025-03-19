import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Bitmap } from '~/items/bitmap'
import type { Circle } from '~/items/circle'
import type { Group } from '~/items/group'
import {
  getItemBounds,
  type Item,
  type ItemByType,
  type ItemData,
} from '~/items/item'
import type { Line } from '~/items/line'
import type { Rect } from '~/items/rect'
import type { Text } from '~/items/text'
import { useCircle } from '~/tools/circle'
import { useDraw } from '~/tools/draw'
import { useLine } from '~/tools/line'
import { useRect } from '~/tools/rect'
import { useSelect } from '~/tools/select'
import { useText } from '~/tools/text'
import type { Bounds, Point, Size } from '~/types'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { addPoints } from '~/utils/point'
import { getPointSnap } from '~/utils/snap'
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

export const useEditor = defineStore('editor', () => {
  // Tools
  const draw = useDraw()
  const select = useSelect()
  const rect = useRect()
  const circle = useCircle()
  const line = useLine()
  const text = useText()
  const tools = { draw, select, rect, circle, line, text }
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
  const frames = ref(new Map<Id, Frame>())
  const activeFrame = ref<Frame>()
  const frameBounds = computed(() => {
    if (!activeFrame.value) return emptyBounds
    return makeBounds({ x: 0, y: 0 }, activeFrame.value.size)
  })

  const addFrame = (data: Partial<Frame>): Frame => {
    const id = createId()
    frames.value.set(id, {
      id,
      name: `Frame${id}`,
      size: { width: 128, height: 64 },
      scale: 5,
      children: [],
      ...data,
    })
    return frames.value.get(id)!
  }

  const removeFrame = (id: Id) => frames.value.delete(id)
  const activateFrame = (id: Id) => (activeFrame.value = frames.value.get(id))

  // Items
  const items = computed(() => activeFrame.value?.children ?? [])
  const itemsFlat = computed(() => {
    if (!activeFrame.value) return []

    const result: Item[] = []
    const stack: Item[] = [...activeFrame.value.children]

    while (stack.length) {
      const current = stack.pop()!
      result.push(current)
      if (current.type === 'group') stack.push(...current.children)
    }
    return result
  })

  const focusedItem = ref<Item | null>(null)

  const addItem = <T extends ItemData, R = ItemByType<T['type']>>(
    data: T,
  ): R | undefined => {
    if (!activeFrame.value) return

    const id = createId()
    const bounds = data.type !== 'group' ? getItemBounds(data) : null
    const name = capitalizeFirstLetter(data.type)
    const item = {
      ...data,
      isLocked: false,
      isHidden: false,
      bounds,
      id,
      name,
    } as R
    activeFrame.value.children.unshift(item as Item)
    // Pushing the item makes it reactive, so in order return the reactive item
    // we have to retrieve it from children.
    return activeFrame.value.children[0] as R
  }

  const removeItem = (item: Item) => {
    if (!activeFrame.value) return

    const index = activeFrame.value.children.findIndex((v) => v.id === item.id)
    activeFrame.value.children.splice(index, 1)
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
    const targets = itemsFlat.value
      .filter((v) => v.type !== 'group' && !ignoreTargets.includes(v))
      .map((v) => v.bounds!)

    targets.push(frameBounds.value)
    const { amount, guides } = getPointSnap(point, targets, snapThreshold.value)
    snapGuides.value = guides
    return addPoints(point, amount)
  }

  return {
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
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEditor, import.meta.hot))
