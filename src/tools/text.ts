import { useEventBus, useMagicKeys } from '@vueuse/core'
import icon from '~/assets/icons/icon-text.svg'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import type { Point } from '~/types'
import { clonePoint } from '~/utils/point'
import { defineTool } from './tool'

// in `TextProperties` we wan't to autofocus the content. This event bus emits
// when the mouseup event occurred after a text is added.
export const afterTextAdded = useEventBus('text-added')

export const useText = defineTool('text', {
  icon,
  shortcut: 't',
  pointRounding: 'floor',
  setup: () => {
    const project = useProject()
    const editor = useEditor()
    const history = useHistory()
    const { ctrl: snapDisabled } = useMagicKeys()

    const onMouseDown = (point: Point) => {
      if (!snapDisabled.value) editor.snapPoint(point)

      const text = project.addItem({
        type: 'text',
        content: 'Text',
        color: 15,
        position: clonePoint(point),
        font: editor.currentFont,
      })
      if (text) editor.focusItem(text)
      if (text) history.saveState()
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
})
