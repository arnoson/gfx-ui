import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Frame } from '~/frame'
import { getItemBounds, type Item } from '~/items/item'
import { useCircle } from '~/tools/circle'
import { useLine } from '~/tools/line'
import { usePencil } from '~/tools/pencil'
import { useRect } from '~/tools/rect'
import { useSelect } from '~/tools/select'
import { useText } from '~/tools/text'
import type { Bounds, Point } from '~/types'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { addPoints } from '~/utils/point'
import { getBoundsSnap, getPointSnap } from '~/utils/snap'
import { useProject } from './project'

type Id = number

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
  const project = useProject()

  const viewCode = ref(false)
  const isSelecting = ref(false)
  const isMoving = ref(false)

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
  const activeFrame = ref<Frame>()
  const frameBounds = computed(() => {
    if (!activeFrame.value) return emptyBounds
    return makeBounds({ x: 0, y: 0 }, activeFrame.value.size)
  })

  const activateFrame = (id: Id) => {
    activeFrame.value = project.frames.find((v) => v.id === id)
    selectedItems.value.clear()
    focusedItem.value = null
    selectionBounds.value = null
  }

  // Items
  const focusedItem = ref<Item | null>(null)
  const copiedItems = ref<Item[] | null>(null)
  const itemsFlat = computed(() => {
    if (!activeFrame.value) return []
    return flattenNestedItems(activeFrame.value.children)
  })

  const focusItem = (item: Item) => {
    focusedItem.value = item
    selectedItems.value.clear()
    selectedItems.value.add(item)
  }

  // Selection
  const selectionBounds = ref<Bounds | null>(null)
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
      .map((v) => v.bounds ?? getItemBounds(v))

    targets.push(frameBounds.value)
    const { amount, guides } = getPointSnap(point, targets, snapThreshold.value)
    snapGuides.value = guides
    return addPoints(point, amount)
  }

  const snapBounds = (bounds: Bounds, ignoreTargets: Item[] = []) => {
    const ignoreTargetsFlat = flattenNestedItems(ignoreTargets)
    const targets = itemsFlat.value
      .filter((v) => v.type !== 'group' && !ignoreTargetsFlat.includes(v))
      .map((v) => v.bounds ?? getItemBounds(v))

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
    viewCode,
    isSelecting,
    isMoving,

    tools,
    activeTool,
    activateTool,

    frames,
    activeFrame,
    frameBounds,
    activateFrame,

    copiedItems,
    focusedItem,
    focusItem,

    selectionBounds,
    selectedItems,
    selectedItemBounds,

    snapThreshold,
    snapGuides,
    resetSnapGuides,
    snapPoint,
    snapBounds,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEditor, import.meta.hot))
