import type { Point } from '~/types'
import { defineTool } from './tool'
import { useEditor } from '~/stores/editor'
import { useEventBus, useMagicKeys } from '@vueuse/core'
import { clonePoint } from '~/utils/point'

// in `TextProperties` we wan't to autofocus the content. This event bus emits
// when the mouseup event occurred after a text is added.
export const afterTextAdded = useEventBus('text-added')

export const useText = defineTool(
  'text',
  () => {
    const editor = useEditor()
    const { ctrl: snapDisabled } = useMagicKeys()

    const onMouseDown = (point: Point) => {
      if (!snapDisabled.value) editor.snapPoint(point)

      const text = editor.addItem({
        type: 'text',
        content: 'Text',
        color: 15,
        position: clonePoint(point),
        font: 'miwos7pt',
      })
      if (text) editor.focusItem(text)
      editor.activateTool('select')
      editor.resetSnapGuides()

      window.addEventListener('mouseup', () => afterTextAdded.emit(), {
        once: true,
      })
    }

    const onMouseMove = (point: Point) => {
      if (!snapDisabled.value) editor.snapPoint(point)
    }

    return { onMouseDown, onMouseMove }
  },
  { pointRounding: 'floor', shortcut: 't' },
)
