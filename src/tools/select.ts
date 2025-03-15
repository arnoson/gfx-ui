import { getItemBounds, translateItem } from '~/items/item'
import { useEditor } from '~/stores/editor'
import type { Point } from '~/types'
import {
  boundsContainPoint,
  getTranslatedBounds,
  makeBounds,
} from '~/utils/bounds'
import { defineTool } from './tool'

export const useSelect = defineTool(
  'select',
  () => {
    const editor = useEditor()

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
        editor.selectionBounds = null
        editor.selectedItems.clear()
      }
      editor.isSelecting = false
      mode = 'idle'
    }

    const startMove = (point: Point) => {
      lastPoint = point
      mode = 'move'
    }

    const move = (point: Point) => {
      if (!editor.selectedItems.size && !editor.focusedItem) return

      const items = editor.selectedItems.size
        ? editor.selectedItems
        : [editor.focusedItem!]

      const delta = {
        x: point.x - lastPoint.x,
        y: point.y - lastPoint.y,
      }

      for (const item of items) {
        translateItem(item, delta)
        if (item.type !== 'group') {
          item.bounds = getTranslatedBounds(item.bounds, delta)
        }
      }
      lastPoint = point
    }

    const endMove = () => (mode = 'idle')

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
      if (e.key === 'Delete') {
        if (e.target !== document.body) return

        if (editor.focusedItem) {
          editor.removeItem(editor.focusedItem.id)
          editor.focusedItem = null
        }

        for (const { id } of editor.selectedItems) editor.removeItem(id)
        editor.selectedItems.clear()
        return
      }

      if (e.key === 'Escape') {
        editor.selectedItems.clear()
        return
      }

      if (e.key === 'g' && e.ctrlKey) {
        e.preventDefault()

        if (editor.selectedItems.size) {
          for (const item of editor.selectedItems) editor.removeItem(item.id)
          const group = editor.addItem({
            type: 'group',
            children: [...editor.selectedItems],
          })
        }
      }
    }

    return { onMouseDown, onMouseMove, onMouseUp, onKeyDown }
  },
  { pointRounding: 'floor' },
)
