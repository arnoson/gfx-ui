import { getItemBounds, translateItem, type Item } from '~/items/item'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import {
  boundsContainPoint,
  getTranslatedBounds,
  makeBounds,
} from '~/utils/bounds'
import { defineTool } from './tool'
import { useMagicKeys } from '@vueuse/core'
import { getBoundsSnap } from '~/utils/snap'
import { toRaw } from 'vue'

export const useSelect = defineTool(
  'select',
  () => {
    const editor = useEditor()
    const { ctrl } = useMagicKeys()
    let mode: 'move' | 'select' | 'idle' = 'idle'
    let startPoint = { x: 0, y: 0 }
    let lastPoint = { x: 0, y: 0 }

    const startSelect = (point: Point) => {
      startPoint = point
      editor.focusedItem = null
      editor.selectionBounds = null
      editor.isSelecting = true
      editor.selectedItems.clear()
      mode = 'select'
    }

    const select = (point: Point) => {
      if (!editor.activeFrame) return

      const top = Math.min(startPoint.y, point.y)
      const left = Math.min(startPoint.x, point.x)
      const bottom = Math.max(startPoint.y, point.y)
      const right = Math.max(startPoint.x, point.x)
      const position = { x: left, y: top }
      const size = { width: right - left + 1, height: bottom - top + 1 }
      editor.selectionBounds = makeBounds(position, size)

      for (const item of editor.activeFrame.children) {
        if (item.isHidden || item.isLocked) continue

        const bounds = item.type === 'group' ? getItemBounds(item) : item.bounds
        const isIntersecting =
          bounds.left <= editor.selectionBounds.right &&
          bounds.right >= editor.selectionBounds.left &&
          bounds.top <= editor.selectionBounds.bottom &&
          bounds.bottom >= editor.selectionBounds.top

        if (isIntersecting) editor.selectedItems.add(item)
        else editor.selectedItems.delete(item)
      }
    }

    const endSelect = () => {
      if (!editor.selectedItems.size) {
        editor.selectionBounds = null
      } else if (editor.selectedItems.size === 1) {
        editor.focusedItem = editor.selectedItems.values().next().value!
        // editor.selectionBounds = null
        // editor.selectedItems.clear()
      }
      editor.isSelecting = false
      mode = 'idle'
    }

    const startMove = (point: Point) => {
      lastPoint = point
      startPoint = point
      mode = 'move'
    }

    const move = (point: Point) => {
      // Wait to perform the actual move until the user has moved the mouse a bit.
      if (!editor.isMoving) {
        const distance = Math.hypot(
          startPoint.x - point.x,
          startPoint.y - point.y,
        )
        if (distance > 2) editor.isMoving = true
        else return
      }

      if (!editor.selectedItems.size) return
      editor.resetSnapGuides()

      const delta = { x: point.x - lastPoint.x, y: point.y - lastPoint.y }
      let snapAmount = { x: 0, y: 0 }

      if (!ctrl.value) {
        const snapTargets = editor.itemsFlat
          .filter((v) => v.type !== 'group' && !editor.selectedItems.has(v))
          .map((v) => v.bounds!)

        const frameBounds = makeBounds({ x: 0, y: 0 }, editor.activeFrame!.size)
        snapTargets.push(frameBounds)

        const threshold = editor.snapThreshold
        const bounds = getTranslatedBounds(editor.selectedItemBounds!, delta)
        const { amount, guides } = getBoundsSnap(bounds, snapTargets, threshold)
        snapAmount = amount
        editor.snapGuides = guides
      }

      delta.x += snapAmount.x
      delta.y += snapAmount.y

      for (const item of editor.selectedItems) {
        if (item.isLocked) continue
        translateItem(item, delta)
        if (item.type !== 'group') {
          item.bounds = getTranslatedBounds(item.bounds, delta)
        }
      }
      lastPoint = {
        x: point.x + snapAmount.x,
        y: point.y + snapAmount.y,
      }
    }

    const endMove = () => {
      mode = 'idle'
      editor.isMoving = false
      editor.resetSnapGuides()
    }

    const remove = () => {
      for (const item of editor.selectedItems) {
        if (item === editor.focusedItem) editor.focusedItem = null
        editor.removeItem(item)
      }
      editor.selectedItems.clear()
    }

    const group = () => {
      if (!editor.selectedItems.size) return
      for (const item of editor.selectedItems) editor.removeItem(item)
      const group = editor.addItem({
        type: 'group',
        children: [...editor.selectedItems],
      })
      if (group) editor.focusItem(group)
    }

    const ungroup = () => {
      if (!editor.selectedItems.size) return
      const newSelectedItems = new Set<Item>()
      for (const item of editor.selectedItems) {
        if (item.type !== 'group') continue
        // TODO: insert at correct position and parent.
        for (const child of item.children) {
          editor.addItem(child)
          newSelectedItems.add(child)
        }
        editor.removeItem(item)
        if (editor.focusedItem === item) editor.focusedItem === null
      }
      editor.selectedItems = newSelectedItems
    }

    const copy = () => {
      editor.copiedItems = [...editor.selectedItems]
    }

    const paste = () => {
      if (!editor.copiedItems) return
      editor.selectedItems.clear()
      editor.focusedItem = null
      for (const item of editor.copiedItems) {
        const data = structuredClone(toRaw(item))
        const copy = editor.addItem({ ...data, id: undefined })
        if (copy) editor.selectedItems.add(copy)
      }
    }

    const onMouseDown = (point: Point) => {
      if (
        editor.selectedItemBounds &&
        boundsContainPoint(editor.selectedItemBounds, point)
      ) {
        startMove(point)
      } else {
        startSelect(point)
      }
    }

    const onMouseMove = (point: Point) => {
      if (mode === 'select') select(point)
      else if (mode === 'move') move(point)
    }

    const onMouseUp = () => {
      if (mode === 'select') endSelect()
      else if (mode === 'move') endMove()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && e.target === document.body) {
        remove()
      } else if (e.key === 'Escape') {
        editor.selectedItems.clear()
      } else if (e.key === 'g' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        group()
      } else if (e.key.toLowerCase() === 'g' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        ungroup()
      } else if (e.key === 'c' && e.ctrlKey) {
        copy()
        e.preventDefault()
      } else if (e.key === 'v' && e.ctrlKey) {
        paste()
        e.preventDefault()
      } else if (e.key === 'a' && e.ctrlKey) {
        editor.selectedItems = new Set(editor.items)
        e.preventDefault()
      }
    }

    return { onMouseDown, onMouseMove, onMouseUp, onKeyDown }
  },
  { pointRounding: 'floor', shortcut: 'v' },
)
