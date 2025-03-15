import type { Point } from '~/types'
import { defineTool } from './tool'
import { useEditor } from '~/stores/editor'
import { useEventBus } from '@vueuse/core'

// in `TextProperties` we wan't to autofocus the content. This event bus emits
// when the mouseup event occurred after a text is added.
export const afterTextAdded = useEventBus('text-added')

export const useText = defineTool(
  'text',
  () => {
    const editor = useEditor()

    const onMouseDown = ({ x, y }: Point) => {
      const text = editor.addItem({
        type: 'text',
        content: 'Text',
        color: 15,
        position: { x, y },
        font: 'miwos7pt',
      })
      if (text) editor.focusItem(text)
      editor.activateTool('select')
      window.addEventListener('mouseup', () => afterTextAdded.emit(), {
        once: true,
      })
    }

    return { onMouseDown }
  },
  { pointRounding: 'floor' },
)
