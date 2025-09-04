import { useMagicKeys } from '@vueuse/core'
import { toRaw } from 'vue'
import icon from '~/assets/icons/icon-select.svg'
import { getItemBounds, translateItem } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import type { Point } from '~/types'
import {
  boundsContainPoint,
  getTranslatedBounds,
  makeBounds,
} from '~/utils/bounds'
import { addPoints, pointsAreEqual } from '~/utils/point'
import { defineTool } from './tool'

export const useSelect = defineTool('select', {
  icon,
  shortcut: 'v',
  pointRounding: 'floor',
  setup: () => {
    const project = useProject()
    const editor = useEditor()
    const history = useHistory()

    const { ctrl: snapDisabled, alt } = useMagicKeys()
    let mode: 'move' | 'select' | 'idle' = 'idle'
    let copiedBeforeMove = false
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

        const bounds =
          item.type === 'group' || item.type === 'instance'
            ? getItemBounds(item)
            : item.bounds

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

    const translateSelectedItems = (delta: Point) => {
      for (const item of editor.selectedItems) {
        if (item.isLocked) continue
        translateItem(item, delta)
        if (item.bounds !== null) {
          item.bounds = getTranslatedBounds(item.bounds, delta)
        }
      }
    }

    const startMove = (point: Point, copy = false) => {
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

      if (alt.value && !copiedBeforeMove) {
        copy()
        paste()
        copiedBeforeMove = true
      }

      const delta = { x: point.x - lastPoint.x, y: point.y - lastPoint.y }
      let snapAmount = { x: 0, y: 0 }

      if (!snapDisabled.value) {
        const bounds = getTranslatedBounds(editor.selectedItemBounds!, delta)
        snapAmount = editor.snapBounds(bounds, [...editor.selectedItems])
      }

      delta.x += snapAmount.x
      delta.y += snapAmount.y
      translateSelectedItems(delta)
      lastPoint = addPoints(point, snapAmount)
    }

    const endMove = (point: Point) => {
      editor.isMoving = false
      editor.resetSnapGuides()
      const hasMoved = !pointsAreEqual(startPoint, point)
      if (hasMoved) history.saveState()
      copiedBeforeMove = false
      mode = 'idle'
    }

    const remove = () => {
      for (const item of editor.selectedItems) {
        if (item === editor.focusedItem) editor.focusedItem = null
        project.removeItem(item)
      }
      editor.selectedItems.clear()
    }

    const group = () => {
      if (!editor.selectedItems.size) return
      for (const item of editor.selectedItems) project.removeItem(item)
      const group = project.addItem({
        type: 'group',
        children: [...toRaw(editor.selectedItems)],
      })
      if (group) editor.focusItem(group)
    }

    const ungroup = () => {
      if (!editor.selectedItems.size) return

      const itemsToUngroup = [...editor.selectedItems].map(toRaw)

      editor.selectedItems.clear()
      if (editor.focusedItem?.type === 'group') editor.focusedItem = null

      for (const item of itemsToUngroup) {
        if (item.type !== 'group') {
          editor.selectedItems.add(item)
          continue
        }

        project.removeItem(item)

        for (const child of item.children) {
          const ungroupedChild = project.addItem(child)
          if (ungroupedChild) editor.selectedItems.add(ungroupedChild)
        }
      }
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
        const copy = project.addItem({ ...data, id: undefined })
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

    const onMouseUp = (point: Point) => {
      if (mode === 'select') endSelect()
      else if (mode === 'move') endMove(point)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && e.target === document.body) {
        remove()
        history.saveState()
      } else if (e.key === 'Escape') {
        editor.selectedItems.clear()
      } else if (e.key === 'g' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        group()
        history.saveState()
      } else if (e.key.toLowerCase() === 'g' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        ungroup()
        history.saveState()
      } else if (e.key === 'c' && e.ctrlKey) {
        copy()
        e.preventDefault()
      } else if (e.key === 'v' && e.ctrlKey) {
        e.preventDefault()
        paste()
        history.saveState()
      } else if (e.key === 'a' && e.ctrlKey) {
        editor.selectedItems = new Set(project.items)
        e.preventDefault()
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        if (editor.selectedItems.size) {
          const distance = e.shiftKey ? 5 : 1
          const delta = { x: 0, y: 0 }
          if (e.key === 'ArrowUp') delta.y = -distance
          else if (e.key === 'ArrowDown') delta.y = distance
          else if (e.key === 'ArrowLeft') delta.x = -distance
          else if (e.key === 'ArrowRight') delta.x = distance
          translateSelectedItems(delta)
          history.saveStateDebounced()
        }
      }
    }

    return { onMouseDown, onMouseMove, onMouseUp, onKeyDown }
  },
})
