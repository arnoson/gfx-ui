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

    const snap = (delta: Point) => {
      if (!editor.activeFrame || !editor.selectedItemBounds)
        return { x: 0, y: 0 }

      const bounds = editor.selectedItemBounds
      const snapAmount = { x: 0, y: 0 }
      let minDistanceX = 2
      let minDistanceY = 2

      const snapX = [
        bounds.left + delta.x,
        bounds.center.x + delta.x,
        bounds.right + delta.x,
      ]
      const snapY = [
        bounds.top + delta.y,
        bounds.center.y + delta.y,
        bounds.bottom + delta.y,
      ]

      const frameBounds = makeBounds({ x: 0, y: 0 }, editor.activeFrame.size)

      for (const snap of snapX) {
        for (const x of [
          frameBounds.left,
          frameBounds.center.x,
          frameBounds.right,
        ]) {
          const dist = Math.abs(snap - x)
          if (dist < minDistanceX) {
            minDistanceX = dist
            snapAmount.x = Math.floor(x - snap)
            // prettier-ignore
            const edges = [bounds.top, bounds.bottom, frameBounds.top, frameBounds.bottom]
            editor.snapLineHorizontal = {
              from: { x, y: Math.min(...edges) },
              to: { x, y: Math.max(...edges) },
            }
          }
        }
      }

      for (const snap of snapY) {
        for (const y of [
          frameBounds.top,
          frameBounds.center.y,
          frameBounds.bottom,
        ]) {
          const dist = Math.abs(snap - y)
          if (dist < minDistanceY) {
            minDistanceY = dist
            snapAmount.y = Math.floor(y - snap)
            // prettier-ignore
            const edges = [bounds.left, bounds.right, frameBounds.left, frameBounds.right]
            editor.snapLineVertical = {
              from: { x: Math.min(...edges), y },
              to: { x: Math.max(...edges), y },
            }
          }
        }
      }

      const queue: Item[] = [...editor.activeFrame.children]
      while (queue.length > 0) {
        const current = queue.shift()
        if (!current) break
        if (editor.selectedItems.has(current)) continue
        if (current.isHidden) continue

        if (current.type === 'group') {
          queue.push(...current.children)
        } else {
          const xValues = [
            current.bounds.left,
            current.bounds.center.x,
            current.bounds.right,
          ]
          const yValues = [
            current.bounds.top,
            current.bounds.center.y,
            current.bounds.bottom,
          ]

          for (const snap of snapX) {
            for (const x of xValues) {
              const dist = Math.abs(snap - x)
              if (dist < minDistanceX) {
                minDistanceX = dist
                snapAmount.x = Math.floor(x - snap)
                // prettier-ignore
                const edges = [bounds.top, bounds.bottom, current.bounds.top, current.bounds.bottom]
                editor.snapLineHorizontal = {
                  from: { x, y: Math.min(...edges) },
                  to: { x, y: Math.max(...edges) },
                }
              }
            }
          }

          for (const snap of snapY) {
            for (const y of yValues) {
              const dist = Math.abs(snap - y)
              if (dist < minDistanceY) {
                minDistanceY = dist
                snapAmount.y = Math.floor(y - snap)
                // prettier-ignore
                const edges = [bounds.left, bounds.right, current.bounds.left, current.bounds.right]
                editor.snapLineVertical = {
                  from: { x: Math.min(...edges), y },
                  to: { x: Math.max(...edges), y },
                }
              }
            }
          }
        }
      }

      return snapAmount
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
      editor.snapLineHorizontal = null
      editor.snapLineVertical = null

      const delta = {
        x: point.x - lastPoint.x,
        y: point.y - lastPoint.y,
      }

      const snapAmount = ctrl.value ? { x: 0, y: 0 } : snap(delta)
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
      editor.snapLineHorizontal = null
      editor.snapLineVertical = null
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
      }
    }

    return { onMouseDown, onMouseMove, onMouseUp, onKeyDown }
  },
  { pointRounding: 'floor' },
)
